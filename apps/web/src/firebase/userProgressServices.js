import { db } from './config';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

export const recordUserProgress = async (progressData) => {
  try {
    const progressRef = await addDoc(collection(db, 'userProgress'), {
      ...progressData,
      attemptedAt: serverTimestamp(),
    });

    if (progressData.skillTags && Array.isArray(progressData.skillTags)) {
      await updateUserSkillStats(
        progressData.userId,
        progressData.skillTags,
        progressData.isCorrect,
        progressData.timeSpent,
      );
    }

    return progressRef.id;
  } catch (error) {
    console.error('Error recording user progress:', error);
    throw error;
  }
};

export const recordAdaptiveQuizProgress = async (
  userId,
  subcategory,
  level,
  passed,
  askedQuestions = [],
) => {
  console.warn(
    'DEPRECATED: recordAdaptiveQuizProgress is deprecated and will be removed in a future version. ' +
      'Use updateSubcategoryProgress from progressUtils.js instead.',
  );

  try {
    if (!userId || !subcategory) {
      console.warn('Missing required parameters for recordAdaptiveQuizProgress');
      return;
    }

    const { updateSubcategoryProgress } = await import('../utils/progressUtils');

    const questionCount = 5;
    const correctCount = passed
      ? Math.max(3, Math.floor(questionCount * 0.7))
      : Math.floor(questionCount * 0.4);
    const score = Math.round((correctCount / questionCount) * 100);

    await updateSubcategoryProgress(
      userId,
      subcategory,
      level,
      score,
      passed,
      askedQuestions,
      {
        correct: correctCount,
        total: questionCount,
      },
    );

    try {
      const userStatsRef = doc(db, 'userStats', userId);
      const userStatsDoc = await getDoc(userStatsRef);

      if (userStatsDoc.exists()) {
        const userStats = userStatsDoc.data();
        const subcategoryStats = userStats.subcategoryStats || {};
        const subcategoryStat = subcategoryStats[subcategory] || {
          correct: 0,
          total: 0,
          attempts: 0,
          lastAttemptAt: null,
        };

        subcategoryStat.correct += correctCount;
        subcategoryStat.total += questionCount;
        subcategoryStat.attempts += 1;
        subcategoryStat.lastAttemptAt = new Date();
        subcategoryStat.accuracy = Math.round(
          (subcategoryStat.correct / subcategoryStat.total) * 100,
        );

        subcategoryStats[subcategory] = subcategoryStat;

        await updateDoc(userStatsRef, {
          subcategoryStats,
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(userStatsRef, {
          userId,
          subcategoryStats: {
            [subcategory]: {
              correct: correctCount,
              total: questionCount,
              attempts: 1,
              lastAttemptAt: new Date(),
              accuracy: Math.round((correctCount / questionCount) * 100),
            },
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (statsError) {
      console.error('Error updating legacy user stats:', statsError);
    }

    console.log(`Recorded adaptive quiz progress for user ${userId} in subcategory ${subcategory}`);
  } catch (error) {
    console.error('Error recording adaptive quiz progress:', error);
    throw error;
  }
};

export const updateUserSkillStats = async (userId, skillTags, isCorrect, timeSpent) => {
  try {
    for (const skillId of skillTags) {
      const statRef = doc(db, 'userSkillStats', `${userId}_${skillId}`);
      const statDoc = await getDoc(statRef);

      if (statDoc.exists()) {
        const currentStats = statDoc.data();
        const totalAttempts = currentStats.totalAttempts + 1;
        const correctAttempts = isCorrect
          ? currentStats.correctAttempts + 1
          : currentStats.correctAttempts;
        const accuracyRate = (correctAttempts / totalAttempts) * 100;
        const totalTimeSpent = currentStats.averageTimeSpent * currentStats.totalAttempts + timeSpent;
        const averageTimeSpent = totalTimeSpent / totalAttempts;

        await updateDoc(statRef, {
          totalAttempts,
          correctAttempts,
          accuracyRate,
          averageTimeSpent,
          lastUpdated: serverTimestamp(),
        });
      } else {
        await setDoc(statRef, {
          id: `${userId}_${skillId}`,
          userId,
          skillId,
          totalAttempts: 1,
          correctAttempts: isCorrect ? 1 : 0,
          accuracyRate: isCorrect ? 100 : 0,
          averageTimeSpent: timeSpent,
          lastUpdated: serverTimestamp(),
        });
      }
    }
  } catch (error) {
    console.error('Error updating user skill stats:', error);
    throw error;
  }
};

export const getUserSkillStats = async (userId) => {
  try {
    const q = query(
      collection(db, 'userSkillStats'),
      where('userId', '==', userId),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((snapshot) => ({
      id: snapshot.id,
      ...snapshot.data(),
    }));
  } catch (error) {
    console.error('Error getting user skill stats:', error);
    throw error;
  }
};
