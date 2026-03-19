import { db } from './config';
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where
} from 'firebase/firestore';
import { getKebabCaseFromAnyFormat, getSubcategoryIdFromString } from '../utils/subcategoryConstants';
import { normalizeQuestionData, normalizeQuestions } from '../utils/questionUtils';

/**
 * Create a new question with skill tags.
 * @param {Object} questionData - The question data including skill tags.
 * @returns {Promise<string>} - The ID of the created question.
 */
export const createQuestion = async (questionData) => {
  try {
    const normalizedQuestion = normalizeQuestionData(questionData);

    const questionRef = await addDoc(collection(db, 'questions'), {
      ...normalizedQuestion,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return questionRef.id;
  } catch (error) {
    console.error('Error creating question:', error);
    throw error;
  }
};

/**
 * Get questions by module.
 * @param {string} moduleId - The module ID to filter by.
 * @returns {Promise<Array>} - Array of questions for the module.
 */
export const getQuestionsByModule = async (moduleId) => {
  try {
    const q = query(
      collection(db, 'questions'),
      where('module', '==', moduleId)
    );
    const querySnapshot = await getDocs(q);
    const questions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return normalizeQuestions(questions);
  } catch (error) {
    console.error('Error getting questions by module:', error);
    throw error;
  }
};

/**
 * Get questions by skill tag.
 * @param {string} skillTagId - The skill tag ID to filter by.
 * @returns {Promise<Array>} - Array of questions with the skill tag.
 */
export const getQuestionsBySkillTag = async (skillTagId) => {
  try {
    const q = query(
      collection(db, 'questions'),
      where('skillTags', 'array-contains', skillTagId)
    );
    const querySnapshot = await getDocs(q);
    const questions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return normalizeQuestions(questions);
  } catch (error) {
    console.error('Error getting questions by skill tag:', error);
    throw error;
  }
};

/**
 * Get questions by category path.
 * @param {string} categoryPath - The category path to filter by.
 * @returns {Promise<Array>} - Array of questions in the category.
 */
export const getQuestionsByCategory = async (categoryPath) => {
  try {
    const q = query(
      collection(db, 'questions'),
      where('categoryPath', '==', categoryPath)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error getting questions for category ${categoryPath}:`, error);
    throw error;
  }
};

/**
 * Get most recent questions, sorted by creation date.
 * @param {number} maxResults - The maximum number of questions to return.
 * @returns {Promise<Array>} - Array of questions sorted by creation date (newest first).
 */
export const getRecentQuestions = async (maxResults = 100) => {
  try {
    console.log('Fetching recent questions, limit:', maxResults);

    const recentQuestionsQuery = query(
      collection(db, 'questions'),
      orderBy('createdAt', 'desc'),
      limit(maxResults)
    );

    console.log('Executing query for recent questions ordered by date');
    const snapshot = await getDocs(recentQuestionsQuery);

    console.log(`Found ${snapshot.docs.length} questions ordered by date`);

    const questions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log('Successfully fetched questions ordered by date');
    return questions;
  } catch (error) {
    console.error('Error getting recent questions:', error);

    console.log('Falling back to unordered query with client-side sorting');
    try {
      const fallbackQuery = query(
        collection(db, 'questions'),
        limit(maxResults)
      );

      const snapshot = await getDocs(fallbackQuery);

      const questions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      questions.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          const aTime = a.createdAt.toMillis ? a.createdAt.toMillis() : a.createdAt;
          const bTime = b.createdAt.toMillis ? b.createdAt.toMillis() : b.createdAt;
          return bTime - aTime;
        }
        if (a.createdAt) return -1;
        if (b.createdAt) return 1;
        return 0;
      });

      return questions;
    } catch (fallbackError) {
      console.error('Fallback query also failed:', fallbackError);
      return [];
    }
  }
};

/**
 * Get questions by subcategory.
 * @param {string} subcategory - The subcategory to filter by (any format).
 * @param {string} [difficulty] - Optional difficulty level filter.
 * @param {number} [limitCount=50] - Optional limit on number of results.
 * @returns {Promise<Array>} - Array of questions with the specified subcategory.
 */
export const getQuestionsBySubcategory = async (subcategory, difficulty = null, limitCount = 50) => {
  try {
    const kebabSubcategory = getKebabCaseFromAnyFormat(subcategory);

    if (!kebabSubcategory) {
      console.warn(`Could not convert subcategory to kebab-case: ${subcategory}`);
      return [];
    }

    console.log(`Fetching questions for subcategory: ${subcategory} (normalized to: ${kebabSubcategory})`);

    const queryObjects = [];

    const baseQuery = difficulty ?
      query(
        collection(db, 'questions'),
        where('subcategory', '==', kebabSubcategory),
        where('difficulty', '==', difficulty),
        limit(limitCount)
      ) :
      query(
        collection(db, 'questions'),
        where('subcategory', '==', kebabSubcategory),
        limit(limitCount)
      );

    queryObjects.push({ type: 'kebab-case', query: baseQuery });

    const titleCaseSubcategory = kebabSubcategory
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const titleCaseQuery = difficulty ?
      query(
        collection(db, 'questions'),
        where('subcategory', '==', titleCaseSubcategory),
        where('difficulty', '==', difficulty),
        limit(limitCount)
      ) :
      query(
        collection(db, 'questions'),
        where('subcategory', '==', titleCaseSubcategory),
        limit(limitCount)
      );

    queryObjects.push({ type: 'title-case', query: titleCaseQuery });

    const numericId = getSubcategoryIdFromString ? getSubcategoryIdFromString(subcategory) : null;

    if (numericId) {
      const numericQuery = difficulty ?
        query(
          collection(db, 'questions'),
          where('subcategoryId', '==', numericId),
          where('difficulty', '==', difficulty),
          limit(limitCount)
        ) :
        query(
          collection(db, 'questions'),
          where('subcategoryId', '==', numericId),
          limit(limitCount)
        );

      queryObjects.push({ type: 'numeric-id', query: numericQuery });
    }

    const alternateFieldQuery = difficulty ?
      query(
        collection(db, 'questions'),
        where('subCategory', '==', kebabSubcategory),
        where('difficulty', '==', difficulty),
        limit(limitCount)
      ) :
      query(
        collection(db, 'questions'),
        where('subCategory', '==', kebabSubcategory),
        limit(limitCount)
      );

    queryObjects.push({ type: 'alternate-field', query: alternateFieldQuery });

    const categoryPathQuery = query(
      collection(db, 'questions'),
      where('categoryPath', 'array-contains', kebabSubcategory),
      limit(limitCount)
    );

    queryObjects.push({ type: 'category-path', query: categoryPathQuery });

    const resultsMap = {};
    let foundResults = false;

    for (const queryObject of queryObjects) {
      if (foundResults) break;

      const querySnapshot = await getDocs(queryObject.query);

      if (!querySnapshot.empty) {
        querySnapshot.docs.forEach(doc => {
          resultsMap[doc.id] = {
            id: doc.id,
            ...doc.data()
          };
        });
        foundResults = true;
        console.log(`Found ${querySnapshot.docs.length} questions using ${queryObject.type} query`);
      }
    }

    let questions = normalizeQuestions(Object.values(resultsMap));

    questions = questions.filter(q => !q.usageContext || q.usageContext === 'general');

    console.log(`[getQuestionsBySubcategory] Returning ${questions.length} questions (filtered for general use)`);
    if (questions.length > 0) {
      console.log(
        '[getQuestionsBySubcategory] Sample question contexts:',
        questions.slice(0, 3).map(q => ({ id: q.id, usageContext: q.usageContext }))
      );
    }

    return questions;
  } catch (error) {
    console.error(`Error getting questions for subcategory ${subcategory}:`, error);
    throw error;
  }
};

/**
 * Enrich a question with new category information.
 * @param {Object} question - The question to enrich.
 * @returns {Object} - The enriched question.
 */
export const enrichQuestionWithNewCategories = (question) => {
  if (question.categoryPath && question.subcategory) {
    return question;
  }

  const mathMainCategories = {
    'Algebra': [
      'Linear equations in one variable',
      'Linear functions',
      'Linear equations in two variables',
      'Systems of two linear equations in two variables',
      'Linear inequalities in one or two variables'
    ],
    'Advanced Math': [
      'Nonlinear functions',
      'Nonlinear equations in one variable and systems of equations in two variables',
      'Equivalent expressions'
    ],
    'Problem-Solving and Data Analysis': [
      'Ratios, rates, proportional relationships, and units',
      'Percentages',
      'One-variable data: Distributions and measures of center and spread',
      'Two-variable data: Models and scatterplots',
      'Probability and conditional probability',
      'Inference from sample statistics and margin of error',
      'Evaluating statistical claims: Observational studies and experiments'
    ],
    'Geometry and Trigonometry': [
      'Area and volume',
      'Lines, angles, and triangles',
      'Right triangles and trigonometry',
      'Circles'
    ]
  };

  const readingWritingMainCategories = {
    'Information and Ideas': [
      'Central Ideas and Details',
      'Inferences',
      'Command of Evidence'
    ],
    'Craft and Structure': [
      'Words in Context',
      'Text Structure and Purpose',
      'Cross-Text Connections'
    ],
    'Expression of Ideas': [
      'Rhetorical Synthesis',
      'Transitions',
      'Boundaries',
      'Form, Structure, and Sense'
    ]
  };

  let categoryPath = '';
  let mainCategory = '';
  let subcategory = question.subcategory || question.subCategory || '';
  let subjectArea = '';

  if (question.mainSkillCategory) {
    if (['Algebra', 'Advanced Math', 'Problem-Solving and Data Analysis', 'Geometry and Trigonometry'].includes(question.mainSkillCategory)) {
      subjectArea = 'Math';
      mainCategory = question.mainSkillCategory;
    } else {
      subjectArea = 'Reading and Writing';
      for (const [category, subcats] of Object.entries(readingWritingMainCategories)) {
        if (subcats.includes(question.mainSkillCategory)) {
          mainCategory = category;
          break;
        }
      }
    }
  } else if (question.category) {
    if ([1, 2].includes(Number(question.category))) {
      subjectArea = 'Reading and Writing';
    } else if ([3, 4].includes(Number(question.category))) {
      subjectArea = 'Math';
    }
  }

  if (subcategory && !subjectArea) {
    let found = false;
    for (const [category, subcats] of Object.entries(mathMainCategories)) {
      if (subcats.includes(subcategory)) {
        subjectArea = 'Math';
        mainCategory = category;
        found = true;
        break;
      }
    }

    if (!found) {
      for (const [category, subcats] of Object.entries(readingWritingMainCategories)) {
        if (subcats.includes(subcategory)) {
          subjectArea = 'Reading and Writing';
          mainCategory = category;
          break;
        }
      }
    }
  }

  if (subjectArea && mainCategory && subcategory) {
    categoryPath = `${subjectArea}/${mainCategory}/${subcategory}`;
  } else if (subjectArea && mainCategory) {
    categoryPath = `${subjectArea}/${mainCategory}`;
  } else if (subjectArea) {
    categoryPath = subjectArea;
  }

  const skillTags = question.skillTags || [];

  return {
    ...question,
    categoryPath,
    subcategory: subcategory || '',
    mainCategory: mainCategory || '',
    subjectArea: subjectArea || '',
    skillTags
  };
};

/**
 * Get questions by IDs.
 * @param {Array} questionIds - Array of question IDs.
 * @returns {Promise<Array>} - Array of questions.
 */
export const getQuestionsByIds = async (questionIds) => {
  try {
    if (!questionIds || questionIds.length === 0) {
      return [];
    }

    const batchSize = 10;
    const batches = [];

    for (let i = 0; i < questionIds.length; i += batchSize) {
      const batch = questionIds.slice(i, i + batchSize);
      batches.push(batch);
    }

    let allQuestions = [];

    for (const batch of batches) {
      const q = query(
        collection(db, 'questions'),
        where('__name__', 'in', batch)
      );

      const querySnapshot = await getDocs(q);
      const batchQuestions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const enrichedBatchQuestions = batchQuestions.map(enrichQuestionWithNewCategories);

      allQuestions = [...allQuestions, ...enrichedBatchQuestions];
    }

    const questionsMap = {};
    allQuestions.forEach(question => {
      questionsMap[question.id] = question;
    });

    return questionIds.map(id => questionsMap[id]).filter(Boolean);
  } catch (error) {
    console.error('Error getting questions by IDs:', error);
    throw error;
  }
};
