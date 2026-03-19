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
  updateDoc
} from 'firebase/firestore';
import { validateAndCorrectCategories } from '../utils/adminQuestionImportUtils';
import {
  normalizeAdminQuestion,
  sortQuestionsByCreatedAt
} from '../utils/adminQuestionManagementUtils';
import {
  getKebabCaseFromAnyFormat,
  getSubcategoryIdFromString
} from '../utils/subcategoryConstants';
import { db } from './config';

export async function checkAdminAccess(userId) {
  if (!userId) {
    return false;
  }

  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.exists() && Boolean(userDoc.data()?.isAdmin);
}

export async function fetchSkillTags() {
  const skillTagsSnapshot = await getDocs(collection(db, 'skillTags'));

  return skillTagsSnapshot.docs.map(skillTagDoc => ({
    id: skillTagDoc.id,
    ...skillTagDoc.data()
  }));
}

export async function fetchAdminQuestions() {
  const questionsSnapshot = await getDocs(collection(db, 'questions'));
  const questions = questionsSnapshot.docs.map(questionDoc =>
    normalizeAdminQuestion(questionDoc.id, questionDoc.data())
  );

  return sortQuestionsByCreatedAt(questions);
}

export async function fetchAllQuestionsRaw() {
  const questionsSnapshot = await getDocs(collection(db, 'questions'));

  return questionsSnapshot.docs.map(questionDoc => ({
    id: questionDoc.id,
    ...questionDoc.data()
  }));
}

export async function fetchRecentSmartQuizzes(resultLimit = 100) {
  const quizzesQuery = query(
    collection(db, 'smartQuizzes'),
    orderBy('createdAt', 'desc'),
    limit(resultLimit)
  );
  const quizzesSnapshot = await getDocs(quizzesQuery);

  return quizzesSnapshot.docs.map(quizDoc => ({
    id: quizDoc.id,
    ...quizDoc.data()
  }));
}

export async function fetchSmartQuizDetails(quizId) {
  const quizDoc = await getDoc(doc(db, 'smartQuizzes', quizId));

  if (!quizDoc.exists()) {
    return {
      quiz: null,
      questions: []
    };
  }

  const quiz = {
    id: quizDoc.id,
    ...quizDoc.data()
  };
  const questions = [];

  for (const questionId of quiz.questionIds || []) {
    const questionDoc = await getDoc(doc(db, 'questions', questionId));

    if (questionDoc.exists()) {
      questions.push({
        id: questionDoc.id,
        ...questionDoc.data()
      });
    }
  }

  return { quiz, questions };
}

export async function deleteQuestionById(questionId) {
  await deleteDoc(doc(db, 'questions', questionId));
}

export async function updateSmartQuizQuestionIds(quizId, questionIds) {
  await updateDoc(doc(db, 'smartQuizzes', quizId), {
    questionIds,
    questionCount: questionIds.length,
    updatedAt: serverTimestamp()
  });
}

export async function updateQuestionUsageContexts(questionIds, usageContext) {
  const failedIds = [];
  let successCount = 0;

  for (const questionId of questionIds) {
    try {
      await updateDoc(doc(db, 'questions', questionId), {
        usageContext,
        updatedAt: serverTimestamp()
      });
      successCount += 1;
    } catch (error) {
      console.error(`Error updating question ${questionId}:`, error);
      failedIds.push(questionId);
    }
  }

  return {
    failedIds,
    successCount
  };
}

async function removeQuestionIdsFromCollection(collectionName, questionIds, options = {}) {
  const collectionSnapshot = await getDocs(collection(db, collectionName));

  for (const recordDoc of collectionSnapshot.docs) {
    const record = { id: recordDoc.id, ...recordDoc.data() };
    if (!Array.isArray(record.questionIds)) {
      continue;
    }

    const filteredQuestionIds = record.questionIds.filter(
      questionId => !questionIds.includes(questionId)
    );

    if (filteredQuestionIds.length === record.questionIds.length) {
      continue;
    }

    const updates = {
      questionIds: filteredQuestionIds,
      updatedAt: serverTimestamp()
    };

    if (options.includeQuestionCount) {
      updates.questionCount = filteredQuestionIds.length;
    }

    await updateDoc(doc(db, collectionName, record.id), updates);
  }
}

export async function bulkDeleteQuestions(questionIds) {
  if (questionIds.length === 0) {
    throw new Error('No questions selected for deletion');
  }

  const deletedIds = [];
  const failedIds = [];
  const [testQuestionId, ...remainingIds] = questionIds;

  try {
    await deleteDoc(doc(db, 'questions', testQuestionId));
    deletedIds.push(testQuestionId);
  } catch (error) {
    throw new Error(`Permission denied: ${error.message}`);
  }

  for (const questionId of remainingIds) {
    try {
      await deleteDoc(doc(db, 'questions', questionId));
      deletedIds.push(questionId);
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Failed to delete question ${questionId}:`, error);
      failedIds.push(questionId);
    }
  }

  if (deletedIds.length > 0) {
    await removeQuestionIdsFromCollection('examModules', deletedIds);
    await removeQuestionIdsFromCollection('practiceExams', deletedIds);
    await removeQuestionIdsFromCollection('smartQuizzes', deletedIds, {
      includeQuestionCount: true
    });
  }

  return {
    deletedIds,
    failedIds
  };
}

export async function repairPracticeExamData() {
  const modulesSnapshot = await getDocs(collection(db, 'examModules'));
  const examsSnapshot = await getDocs(collection(db, 'practiceExams'));
  const modulesCount = modulesSnapshot.docs.length;
  const examsCount = examsSnapshot.docs.length;

  if (modulesCount === 0) {
    const placeholderModule = {
      title: 'Example Module',
      description: 'This is an example module created by the repair function',
      questionIds: [],
      moduleNumber: 1,
      calculatorAllowed: false,
      timeLimit: 1920,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const moduleRef = await addDoc(collection(db, 'examModules'), placeholderModule);

    if (examsCount === 0) {
      const placeholderExam = {
        title: 'Example Practice Exam',
        description: 'This is an example practice exam created by the repair function',
        moduleIds: [moduleRef.id],
        isPublic: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const examRef = await addDoc(collection(db, 'practiceExams'), placeholderExam);

      return {
        action: 'created_module_and_exam',
        moduleId: moduleRef.id,
        examId: examRef.id
      };
    }

    return {
      action: 'created_module_only',
      moduleId: moduleRef.id
    };
  }

  if (examsCount === 0) {
    const firstModule = modulesSnapshot.docs[0];
    const placeholderExam = {
      title: 'Example Practice Exam',
      description: 'This is an example practice exam created by the repair function',
      moduleIds: [firstModule.id],
      isPublic: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const examRef = await addDoc(collection(db, 'practiceExams'), placeholderExam);

    return {
      action: 'created_exam_only',
      examId: examRef.id
    };
  }

  return {
    action: 'none'
  };
}

export async function repairExamModuleData() {
  const modulesSnapshot = await getDocs(collection(db, 'examModules'));

  if (modulesSnapshot.docs.length > 0) {
    return { action: 'none' };
  }

  const placeholderModule = {
    title: 'Example Module',
    description: 'This is an example module created by the repair function',
    questionIds: [],
    moduleNumber: 1,
    calculatorAllowed: false,
    timeLimit: 1920,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const moduleRef = await addDoc(collection(db, 'examModules'), placeholderModule);

  return {
    action: 'created_module',
    moduleId: moduleRef.id
  };
}

export async function migrateQuestionSubcategories() {
  const questionsSnapshot = await getDocs(collection(db, 'questions'));
  let updatedCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const questionDoc of questionsSnapshot.docs) {
    try {
      const questionData = questionDoc.data();
      const subcategorySource =
        questionData.subcategory ||
        questionData.subCategory ||
        questionData.subcategoryId;

      if (!subcategorySource) {
        errors.push(`No subcategory found for question ${questionDoc.id}`);
        errorCount += 1;
        continue;
      }

      const normalizedSubcategory = getKebabCaseFromAnyFormat(subcategorySource);
      const numericSubcategoryId = getSubcategoryIdFromString(subcategorySource);

      if (!normalizedSubcategory) {
        errors.push(
          `Could not normalize subcategory '${subcategorySource}' for question ${questionDoc.id}`
        );
        errorCount += 1;
        continue;
      }

      const updates = {};

      if (questionData.subcategory !== normalizedSubcategory) {
        updates.subcategory = normalizedSubcategory;
      }

      if (
        numericSubcategoryId &&
        questionData.subcategoryId !== numericSubcategoryId
      ) {
        updates.subcategoryId = numericSubcategoryId;
      }

      if (Object.keys(updates).length === 0) {
        continue;
      }

      updates.updatedAt = serverTimestamp();
      await updateDoc(doc(db, 'questions', questionDoc.id), updates);
      updatedCount += 1;
    } catch (error) {
      console.error(`Error updating question ${questionDoc.id}:`, error);
      errors.push(`Error updating question ${questionDoc.id}: ${error.message}`);
      errorCount += 1;
    }
  }

  return {
    errorCount,
    errors,
    totalCount: questionsSnapshot.docs.length,
    updatedCount
  };
}

function normalizeImportedDifficulty(originalDifficulty) {
  let normalizedDifficulty = 'medium';
  let warningMessage = null;

  if (typeof originalDifficulty === 'number') {
    if (originalDifficulty === 1) {
      normalizedDifficulty = 'easy';
    } else if (originalDifficulty >= 4) {
      normalizedDifficulty = 'hard';
    }
  } else if (typeof originalDifficulty === 'string') {
    const lowerDifficulty = originalDifficulty.toLowerCase();

    if (['easy', 'level 1'].includes(lowerDifficulty)) {
      normalizedDifficulty = 'easy';
    } else if (['medium', 'level 2', 'level 3'].includes(lowerDifficulty)) {
      normalizedDifficulty = 'medium';
    } else if (['hard', 'level 4', 'level 5'].includes(lowerDifficulty)) {
      normalizedDifficulty = 'hard';
    } else if (['easy', 'medium', 'hard'].includes(originalDifficulty)) {
      normalizedDifficulty = originalDifficulty;
    }
  } else if (originalDifficulty == null) {
    warningMessage = "Missing difficulty, defaulted to 'medium'";
  }

  if (
    normalizedDifficulty !== originalDifficulty &&
    !(
      ['medium', 'level 2', 'level 3'].includes(
        String(originalDifficulty).toLowerCase()
      ) && normalizedDifficulty === 'medium'
    ) &&
    !(originalDifficulty == null && normalizedDifficulty === 'medium')
  ) {
    warningMessage = `Normalized difficulty '${originalDifficulty}' to '${normalizedDifficulty}'`;
  }

  return {
    normalizedDifficulty,
    warningMessage
  };
}

export async function importAdminQuestions(importedQuestions, importUsageContext) {
  if (!Array.isArray(importedQuestions)) {
    throw new Error('Invalid file format. Expected an array of questions.');
  }

  let importCount = 0;
  let correctedCount = 0;
  let warningCount = 0;
  const warnings = [];

  for (const question of importedQuestions) {
    if (!question.text || !question.options || question.correctAnswer == null) {
      warnings.push(
        `Question missing required fields (text, options, or correctAnswer): ${
          question.text ? question.text.substring(0, 50) : 'No text provided'
        }...`
      );
      warningCount += 1;
      continue;
    }

    const validationInput =
      question.subcategory && !question.subCategory
        ? { ...question, subCategory: question.subcategory }
        : { ...question };

    const validationResult = validateAndCorrectCategories(validationInput);
    const processedQuestion = { ...validationResult.question };

    if (validationResult.corrected) {
      correctedCount += 1;
    }

    if (validationResult.warningMessage) {
      warnings.push(
        `${validationResult.warningMessage}: ${question.text.substring(0, 50)}...`
      );
      warningCount += 1;
      continue;
    }

    const subcategorySource =
      processedQuestion.subcategory ||
      processedQuestion.subCategory ||
      processedQuestion.subcategoryId;

    if (subcategorySource) {
      const normalizedSubcategory = getKebabCaseFromAnyFormat(subcategorySource);
      const numericSubcategoryId = getSubcategoryIdFromString(subcategorySource);

      if (normalizedSubcategory) {
        processedQuestion.subcategory = normalizedSubcategory;

        if (numericSubcategoryId) {
          processedQuestion.subcategoryId = numericSubcategoryId;
        }
      } else {
        warnings.push(
          `Could not normalize subcategory '${subcategorySource}' for question: ${question.text.substring(0, 50)}...`
        );
        warningCount += 1;
      }
    } else {
      warnings.push(`No subcategory found for question: ${question.text.substring(0, 50)}...`);
      warningCount += 1;
    }

    if (Array.isArray(processedQuestion.explanation)) {
      processedQuestion.explanation = processedQuestion.explanation.join('\n');
    }

    const { normalizedDifficulty, warningMessage } = normalizeImportedDifficulty(
      question.difficulty
    );
    processedQuestion.difficulty = normalizedDifficulty;

    if (warningMessage) {
      warnings.push(`${warningMessage}: ${question.text.substring(0, 50)}...`);
      warningCount += 1;
    }

    processedQuestion.usageContext = importUsageContext;

    if (processedQuestion.mainSkillCategory) {
      const mainCategoryTag = processedQuestion.mainSkillCategory
        .toLowerCase()
        .replace(/ /g, '-');

      if (!processedQuestion.skillTags) {
        processedQuestion.skillTags = [];
      }

      if (!processedQuestion.skillTags.includes(mainCategoryTag)) {
        processedQuestion.skillTags.push(mainCategoryTag);
      }
    }

    await addDoc(collection(db, 'questions'), {
      ...processedQuestion,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    importCount += 1;
  }

  return {
    correctedCount,
    importCount,
    warningCount,
    warnings
  };
}
