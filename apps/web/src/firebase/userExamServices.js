import { db } from './config';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { getPracticeExamModules } from './practiceExamCatalogServices';
import { updateUserStatsCache } from './rankingServices';

const MAX_RESPONSE_BATCH_SIZE = 200;

const getExamResponses = async (examRef) => {
  const responsesSnapshot = await getDocs(collection(examRef, 'responses'));

  return responsesSnapshot.docs.map((responseDoc) => ({
    id: responseDoc.id,
    ...responseDoc.data(),
  }));
};

const attachPracticeExamModules = async (examData, logLabel) => {
  if (!examData.practiceExamId) {
    return examData;
  }

  try {
    const fullModules = await getPracticeExamModules(examData.practiceExamId);
    if (Array.isArray(fullModules) && fullModules.length > 0) {
      return {
        ...examData,
        modules: fullModules,
      };
    }

    console.warn(
      `[userExamServices] Full modules not found or empty for ${logLabel}: ${examData.practiceExamId}`,
    );
  } catch (error) {
    console.error(
      `[userExamServices] Error fetching full modules for ${logLabel} (${examData.practiceExamId}):`,
      error,
    );
  }

  return examData;
};

export const saveOrUpdateExamProgress = async (userId, progress) => {
  if (!userId || !progress?.practiceExamId) {
    console.error('[saveOrUpdateExamProgress] Missing userId or practiceExamId');
    return null;
  }

  try {
    const progressRef = doc(db, `users/${userId}/examProgress`, progress.practiceExamId);
    const existing = await getDoc(progressRef);
    const existingData = existing.exists() ? existing.data() : null;

    const payload = {
      practiceExamId: progress.practiceExamId,
      examTitle: progress.examTitle || null,
      status: 'in-progress',
      currentModuleIndex:
        typeof progress.currentModuleIndex === 'number' ? progress.currentModuleIndex : 0,
      currentQuestionIndex:
        typeof progress.currentQuestionIndex === 'number' ? progress.currentQuestionIndex : 0,
      moduleResponses: progress.moduleResponses || {},
      modulesMeta: progress.modulesMeta || [],
      updatedAt: serverTimestamp(),
      startedAt: existingData?.startedAt || serverTimestamp(),
    };

    if (typeof progress.currentModuleTimeRemaining === 'number') {
      payload.currentModuleTimeRemaining = progress.currentModuleTimeRemaining;
    }

    await setDoc(progressRef, payload, { merge: true });

    return { id: progressRef.id, ...payload };
  } catch (error) {
    console.error('[saveOrUpdateExamProgress] Error:', error);
    throw error;
  }
};

export const getExamProgress = async (userId, practiceExamId) => {
  if (!userId || !practiceExamId) {
    return null;
  }

  try {
    const progressRef = doc(db, `users/${userId}/examProgress`, practiceExamId);
    const snapshot = await getDoc(progressRef);

    if (!snapshot.exists()) {
      return null;
    }

    return { id: snapshot.id, ...snapshot.data() };
  } catch (error) {
    console.error('[getExamProgress] Error:', error);
    return null;
  }
};

export const getInProgressExams = async (userId) => {
  if (!userId) {
    return [];
  }

  try {
    const progressCollection = collection(db, `users/${userId}/examProgress`);
    const progressQuery = query(progressCollection, orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(progressQuery);

    return snapshot.docs.map((progressDoc) => ({
      id: progressDoc.id,
      ...progressDoc.data(),
    }));
  } catch (error) {
    console.error('[getInProgressExams] Error:', error);
    return [];
  }
};

export const clearExamProgress = async (userId, practiceExamId) => {
  if (!userId || !practiceExamId) {
    return false;
  }

  try {
    const progressRef = doc(db, `users/${userId}/examProgress`, practiceExamId);
    await deleteDoc(progressRef);
    return true;
  } catch (error) {
    console.error('[clearExamProgress] Error:', error);
    return false;
  }
};

export const saveExamResult = async (userId, moduleId, score, maxScore, responses) => {
  if (!userId) {
    return false;
  }

  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return false;
    }

    const userData = userDoc.data();
    const examResults = userData.examResults || [];

    examResults.push({
      moduleId,
      score,
      maxScore,
      responses,
      date: new Date().toISOString(),
    });

    await setDoc(userRef, {
      ...userData,
      examResults,
    });

    return true;
  } catch (error) {
    console.error('Error saving exam result:', error);
    return false;
  }
};

export const saveComprehensiveExamResult = async (userId, examSummary, responses = []) => {
  if (!userId) {
    console.error('Cannot save exam result: No authenticated user');
    return null;
  }

  const safeResponses = Array.isArray(responses) ? responses : [];

  try {
    console.log('Saving comprehensive exam result', {
      summaryFields: Object.keys(examSummary || {}),
      responseCount: safeResponses.length,
    });

    const examData = {
      ...examSummary,
      userId,
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      examDate: new Date().toISOString(),
    };

    const practiceExamsRef = collection(db, `users/${userId}/practiceExams`);
    const examDocRef = await addDoc(practiceExamsRef, examData);
    console.log(`Created exam document with ID: ${examDocRef.id}`);

    for (let i = 0; i < safeResponses.length; i += MAX_RESPONSE_BATCH_SIZE) {
      const batch = writeBatch(db);
      const chunk = safeResponses.slice(i, i + MAX_RESPONSE_BATCH_SIZE);

      chunk.forEach((response) => {
        const responseRef = doc(collection(examDocRef, 'responses'));
        batch.set(responseRef, {
          ...response,
          createdAt: serverTimestamp(),
        });

        const attemptRef = doc(collection(db, 'questionAttempts'));
        batch.set(attemptRef, {
          ...response,
          userId,
          examId: examDocRef.id,
          attemptedAt: serverTimestamp(),
        });
      });

      await batch.commit();
      console.log(`Committed exam response batch ${i / MAX_RESPONSE_BATCH_SIZE + 1}`);
    }

    try {
      await updateUserStatsCache(userId);
      console.log(`[saveComprehensiveExamResult] Updated stats cache for user ${userId}`);
    } catch (cacheError) {
      console.error('[saveComprehensiveExamResult] Error updating stats cache:', cacheError);
    }

    return {
      id: examDocRef.id,
      ...examData,
    };
  } catch (error) {
    console.error('Error saving comprehensive exam result:', error);
    throw error;
  }
};

export const getLatestExamResult = async (userId) => {
  if (!userId) {
    return null;
  }

  try {
    const practiceExamsRef = collection(db, `users/${userId}/practiceExams`);
    const latestExamQuery = query(practiceExamsRef, orderBy('completedAt', 'desc'), limit(1));
    const querySnapshot = await getDocs(latestExamQuery);

    if (querySnapshot.empty) {
      return null;
    }

    const latestExamDoc = querySnapshot.docs[0];
    const latestExam = {
      id: latestExamDoc.id,
      ...latestExamDoc.data(),
      responses: await getExamResponses(latestExamDoc.ref),
    };

    return attachPracticeExamModules(latestExam, 'latest exam');
  } catch (error) {
    console.error('Error getting latest exam result:', error);
    return null;
  }
};

export const getExamResultById = async (userId, examId, includeResponses = true) => {
  if (!userId || !examId) {
    return null;
  }

  try {
    const examRef = doc(db, `users/${userId}/practiceExams`, examId);
    const examDoc = await getDoc(examRef);

    if (!examDoc.exists()) {
      return null;
    }

    const examData = {
      id: examDoc.id,
      ...examDoc.data(),
    };

    if (includeResponses) {
      examData.responses = await getExamResponses(examRef);
    }

    return attachPracticeExamModules(examData, 'exam result');
  } catch (error) {
    console.error(`Error getting exam result ${examId}:`, error);
    return null;
  }
};

export const getUserResults = async (userId) => {
  if (!userId) {
    return [];
  }

  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return [];
    }

    return userDoc.data().examResults || [];
  } catch (error) {
    console.error('Error getting user results:', error);
    return [];
  }
};
