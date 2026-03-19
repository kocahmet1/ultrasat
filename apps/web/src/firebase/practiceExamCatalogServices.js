import { db } from './config';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { getExamModuleById } from './examModuleServices';
import { enrichQuestionWithNewCategories } from './questionBankServices';

/**
 * Utility function to repair broken data in practice exams and modules.
 * This will create an empty placeholder module and exam if none exist.
 * @returns {Promise<Object>} - Details of what was repaired.
 */
export const repairPracticeExamData = async () => {
  try {
    console.log('Starting practice exam data repair...');
    const results = {
      examModulesFound: 0,
      practiceExamsFound: 0,
      modulesCreated: 0,
      examsCreated: 0,
      errors: []
    };

    const moduleSnapshot = await getDocs(collection(db, 'examModules'));
    results.examModulesFound = moduleSnapshot.docs.length;

    const examSnapshot = await getDocs(collection(db, 'practiceExams'));
    results.practiceExamsFound = examSnapshot.docs.length;

    console.log(`Found ${results.examModulesFound} modules and ${results.practiceExamsFound} practice exams`);

    if (results.examModulesFound === 0) {
      try {
        const placeholderModule = {
          title: 'Example Module',
          description: 'This is an example module created by the system repair function',
          questionIds: [],
          moduleNumber: 1,
          calculatorAllowed: false,
          timeLimit: 1920,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        const moduleRef = await addDoc(collection(db, 'examModules'), placeholderModule);
        results.modulesCreated++;
        console.log('Created placeholder module with ID:', moduleRef.id);

        if (results.practiceExamsFound === 0) {
          const placeholderExam = {
            title: 'Example Practice Exam',
            description: 'This is an example practice exam created by the system repair function',
            moduleIds: [moduleRef.id],
            isPublic: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };

          const examRef = await addDoc(collection(db, 'practiceExams'), placeholderExam);
          results.examsCreated++;
          console.log('Created placeholder practice exam with ID:', examRef.id);
        }
      } catch (err) {
        results.errors.push(`Error creating placeholders: ${err.message}`);
        console.error('Error creating placeholders:', err);
      }
    } else if (results.practiceExamsFound === 0) {
      try {
        const firstModule = moduleSnapshot.docs[0];
        const placeholderExam = {
          title: 'Example Practice Exam',
          description: 'This is an example practice exam created by the system repair function',
          moduleIds: [firstModule.id],
          isPublic: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        const examRef = await addDoc(collection(db, 'practiceExams'), placeholderExam);
        results.examsCreated++;
        console.log('Created placeholder practice exam with ID:', examRef.id);
      } catch (err) {
        results.errors.push(`Error creating placeholder exam: ${err.message}`);
        console.error('Error creating placeholder exam:', err);
      }
    }

    return results;
  } catch (error) {
    console.error('Error repairing practice exam data:', error);
    throw error;
  }
};

/**
 * Create a new practice exam composed of existing modules.
 * @param {Object} examData - The practice exam data.
 * @returns {Promise<string>} - The ID of the created practice exam.
 */
export const createPracticeExam = async (examData) => {
  try {
    const moduleIds = examData.moduleIds || [];

    if (moduleIds.length === 0) {
      throw new Error('Practice exam must include at least one module');
    }

    console.log('Validating modules for practice exam creation...');
    for (const moduleId of moduleIds) {
      const moduleRef = doc(db, 'examModules', moduleId);
      const moduleSnap = await getDoc(moduleRef);
      if (!moduleSnap.exists()) {
        throw new Error(`Module with ID ${moduleId} does not exist`);
      }
    }

    const validatedData = {
      ...examData,
      title: examData.title || 'Untitled Practice Exam',
      description: examData.description || 'No description provided',
      moduleIds,
      isPublic: examData.isPublic !== undefined ? examData.isPublic : true,
      isDiagnostic: examData.isDiagnostic || false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const examRef = await addDoc(collection(db, 'practiceExams'), validatedData);
    console.log('Created new practice exam with ID:', examRef.id);
    return examRef.id;
  } catch (error) {
    console.error('Error creating practice exam:', error);
    throw error;
  }
};

/**
 * Get all practice exams.
 * @param {boolean} onlyPublic - Whether to return only public exams.
 * @returns {Promise<Array>} - Array of practice exams.
 */
export const getAllPracticeExams = async (onlyPublic = false) => {
  try {
    let examQuery;

    if (onlyPublic) {
      examQuery = query(
        collection(db, 'practiceExams'),
        where('isPublic', '==', true)
      );
    } else {
      examQuery = collection(db, 'practiceExams');
    }

    const querySnapshot = await getDocs(examQuery);
    const exams = [];

    querySnapshot.forEach((examDoc) => {
      exams.push({
        id: examDoc.id,
        ...examDoc.data()
      });
    });

    return exams;
  } catch (error) {
    console.error('Error getting practice exams:', error);
    throw error;
  }
};

/**
 * Get a practice exam by ID.
 * @param {string} examId - The practice exam ID.
 * @returns {Promise<Object>} - The practice exam data.
 */
export const getPracticeExamById = async (examId) => {
  try {
    const examRef = doc(db, 'practiceExams', examId);
    const examDoc = await getDoc(examRef);

    if (!examDoc.exists()) {
      throw new Error(`Practice exam with ID ${examId} not found`);
    }

    return {
      id: examDoc.id,
      ...examDoc.data()
    };
  } catch (error) {
    console.error(`Error getting practice exam ${examId}:`, error);
    throw error;
  }
};

/**
 * Get all modules for a practice exam.
 * @param {string} examId - The practice exam ID.
 * @returns {Promise<Array>} - Array of exam modules with their questions.
 */
export const getPracticeExamModules = async (examId) => {
  try {
    const exam = await getPracticeExamById(examId);
    const moduleIds = exam.moduleIds || [];

    if (moduleIds.length === 0) {
      return [];
    }

    const modules = [];
    let moduleIndex = 0;

    for (const moduleId of moduleIds) {
      try {
        const module = await getExamModuleById(moduleId);

        let questions = [];
        if (module.questionIds && Array.isArray(module.questionIds)) {
          const questionPromises = module.questionIds.map(async (questionId) => {
            try {
              const questionRef = doc(db, 'questions', questionId);
              const questionDoc = await getDoc(questionRef);

              if (questionDoc.exists()) {
                return {
                  id: questionDoc.id,
                  ...questionDoc.data()
                };
              }
              return null;
            } catch (err) {
              console.warn(`Error fetching question ${questionId}:`, err);
              return null;
            }
          });

          const fetchedQuestions = await Promise.all(questionPromises);
          questions = fetchedQuestions.filter(q => q !== null);
        }

        const enrichedQuestions = questions.map(q => {
          if (typeof enrichQuestionWithNewCategories === 'function') {
            return enrichQuestionWithNewCategories(q);
          }
          return q;
        });

        modules.push({
          ...module,
          questions: enrichedQuestions,
          moduleIndex: moduleIndex++
        });

        console.log(`Loaded module ${module.title || moduleId} with ${enrichedQuestions.length} questions`);
      } catch (error) {
        console.warn(`Could not retrieve module ${moduleId}:`, error);
      }
    }

    modules.sort((a, b) => a.moduleIndex - b.moduleIndex);
    return modules;
  } catch (error) {
    console.error('Error getting practice exam modules:', error);
    throw error;
  }
};

/**
 * Update a practice exam.
 * @param {string} examId - The practice exam ID.
 * @param {Object} examData - The updated exam data.
 * @returns {Promise<void>}
 */
export const updatePracticeExam = async (examId, examData) => {
  try {
    const examRef = doc(db, 'practiceExams', examId);
    await updateDoc(examRef, {
      ...examData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating practice exam:', error);
    throw error;
  }
};

/**
 * Delete a practice exam.
 * @param {string} examId - The practice exam ID.
 * @returns {Promise<void>}
 */
export const deletePracticeExam = async (examId) => {
  try {
    const examRef = doc(db, 'practiceExams', examId);
    await deleteDoc(examRef);
  } catch (error) {
    console.error('Error deleting practice exam:', error);
    throw error;
  }
};

/**
 * Create a complete diagnostic exam with selected modules.
 * @param {Object} examData - The exam data.
 * @returns {Promise<string>} - The ID of the created diagnostic exam.
 */
export const createDiagnosticExam = async (examData) => {
  try {
    const diagnosticExamData = {
      ...examData,
      isDiagnostic: true
    };

    const examId = await createPracticeExam(diagnosticExamData);
    console.log('Created diagnostic exam with ID:', examId);
    return examId;
  } catch (error) {
    console.error('Error creating diagnostic exam:', error);
    throw error;
  }
};
