import { db } from './config';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import {
  enrichQuestionWithNewCategories,
  getQuestionsByIds
} from './questionBankServices';

/**
 * Create a new exam module.
 * @param {Object} moduleData - The module data.
 * @returns {Promise<string>} - The ID of the created module.
 */
export const createExamModule = async (moduleData) => {
  try {
    const validatedData = {
      ...moduleData,
      title: moduleData.title || 'Untitled Module',
      description: moduleData.description || 'No description provided',
      questionIds: moduleData.questionIds || [],
      moduleNumber: moduleData.moduleNumber || 1,
      calculatorAllowed: moduleData.calculatorAllowed !== undefined ? moduleData.calculatorAllowed : false,
      timeLimit: moduleData.timeLimit || 1920,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const moduleRef = await addDoc(collection(db, 'examModules'), validatedData);
    console.log('Created new exam module with ID:', moduleRef.id);
    return moduleRef.id;
  } catch (error) {
    console.error('Error creating exam module:', error);
    throw error;
  }
};

/**
 * Get all exam modules.
 * @returns {Promise<Array>} - Array of exam modules.
 */
export const getAllExamModules = async () => {
  try {
    console.log('Getting all exam modules from database...');
    const querySnapshot = await getDocs(collection(db, 'examModules'));
    const modules = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log(`Found ${modules.length} exam modules`);
    return modules;
  } catch (error) {
    console.error('Error getting exam modules:', error);
    throw error;
  }
};

/**
 * Get an exam module by ID.
 * @param {string} moduleId - The module ID.
 * @returns {Promise<Object>} - The exam module.
 */
export const getExamModuleById = async (moduleId) => {
  try {
    const moduleRef = doc(db, 'examModules', moduleId);
    const moduleDoc = await getDoc(moduleRef);

    if (!moduleDoc.exists()) {
      throw new Error(`Exam module with ID ${moduleId} not found`);
    }

    return {
      id: moduleDoc.id,
      ...moduleDoc.data()
    };
  } catch (error) {
    console.error('Error getting exam module by ID:', error);
    throw error;
  }
};

/**
 * Get an exam module by number.
 * @param {number} moduleNumber - The module number (1-4).
 * @returns {Promise<Object>} - The exam module.
 */
export const getExamModuleByNumber = async (moduleNumber) => {
  try {
    const q = query(
      collection(db, 'examModules'),
      where('moduleNumber', '==', moduleNumber),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error(`No exam module found with number ${moduleNumber}`);
    }

    const moduleDoc = querySnapshot.docs[0];
    return {
      id: moduleDoc.id,
      ...moduleDoc.data()
    };
  } catch (error) {
    console.error('Error getting exam module by number:', error);
    throw error;
  }
};

/**
 * Get questions for an exam module.
 * @param {string} moduleId - The module ID.
 * @returns {Promise<Array>} - Array of questions for the module.
 */
export const getExamModuleQuestions = async (moduleId) => {
  try {
    const moduleRef = doc(db, 'examModules', moduleId);
    const moduleDoc = await getDoc(moduleRef);

    if (!moduleDoc.exists()) {
      throw new Error(`Exam module with ID ${moduleId} not found`);
    }

    const moduleData = moduleDoc.data();
    const questionIds = moduleData.questionIds || [];

    if (questionIds.length === 0) {
      return [];
    }

    return await getQuestionsByIds(questionIds);
  } catch (error) {
    console.error('Error getting exam module questions:', error);
    throw error;
  }
};

/**
 * Generate an exam module based on criteria.
 * @param {Object} options - Module generation options.
 * @returns {Promise<string>} - The ID of the generated module.
 */
export const generateExamModule = async ({
  title,
  description,
  moduleNumber,
  calculatorAllowed,
  categoryPaths = [],
  questionCount = 27,
  difficultyRange = { min: 1, max: 5 },
  timeLimit = 1920
}) => {
  try {
    let questionQuery = null;

    if (!categoryPaths || categoryPaths.length === 0) {
      const subjectPrefix = (moduleNumber <= 2) ? 'Reading and Writing' : 'Math';

      questionQuery = query(
        collection(db, 'questions'),
        where('categoryPath', '>=', subjectPrefix),
        where('categoryPath', '<', subjectPrefix + '\uf8ff')
      );
    } else {
      let allQuestions = [];

      for (const categoryPath of categoryPaths) {
        const q = query(
          collection(db, 'questions'),
          where('categoryPath', '==', categoryPath)
        );

        const querySnapshot = await getDocs(q);
        const batchQuestions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const enrichedBatchQuestions = batchQuestions.map(enrichQuestionWithNewCategories);

        allQuestions = [...allQuestions, ...enrichedBatchQuestions];
      }

      allQuestions = allQuestions.filter(q => {
        const difficulty = q.difficulty || 3;
        return difficulty >= difficultyRange.min && difficulty <= difficultyRange.max;
      });

      const shuffled = allQuestions.sort(() => 0.5 - Math.random());
      const selectedQuestions = shuffled.slice(0, questionCount);

      const moduleData = {
        title,
        description,
        moduleNumber,
        timeLimit,
        calculatorAllowed,
        questionIds: selectedQuestions.map(q => q.id),
        questionCount,
        generatedAutomatically: true,
        difficultyRange
      };

      const moduleId = await createExamModule(moduleData);
      return moduleId;
    }

    if (questionQuery) {
      const querySnapshot = await getDocs(questionQuery);
      let questions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      questions = questions.filter(q => {
        const difficulty = q.difficulty || 3;
        return difficulty >= difficultyRange.min && difficulty <= difficultyRange.max;
      });

      const shuffled = questions.sort(() => 0.5 - Math.random());
      const selectedQuestions = shuffled.slice(0, questionCount);

      const moduleData = {
        title,
        description,
        moduleNumber,
        timeLimit,
        calculatorAllowed,
        questionIds: selectedQuestions.map(q => q.id),
        questionCount,
        generatedAutomatically: true,
        difficultyRange
      };

      const moduleId = await createExamModule(moduleData);
      return moduleId;
    }
  } catch (error) {
    console.error('Error generating exam module:', error);
    throw error;
  }
};

/**
 * Update an exam module.
 * @param {string} moduleId - The module ID.
 * @param {Object} moduleData - The updated module data.
 * @returns {Promise<void>}
 */
export const updateExamModule = async (moduleId, moduleData) => {
  try {
    const docRef = doc(db, 'examModules', moduleId);
    await updateDoc(docRef, {
      ...moduleData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating exam module:', error);
    throw error;
  }
};

/**
 * Delete an exam module.
 * @param {string} moduleId - The module ID to delete.
 * @returns {Promise<void>}
 */
export const deleteExamModule = async (moduleId) => {
  try {
    const moduleRef = doc(db, 'examModules', moduleId);
    await deleteDoc(moduleRef);
    console.log(`Module ${moduleId} successfully deleted`);
  } catch (error) {
    console.error('Error deleting exam module:', error);
    throw error;
  }
};
