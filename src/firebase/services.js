import { db } from './config';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  updateDoc,
  deleteDoc,
  arrayUnion,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { getKebabCaseFromAnyFormat, getSubcategoryIdFromString } from '../utils/subcategoryConstants';
import { normalizeQuestionData, normalizeQuestions } from '../utils/questionUtils';

// ========== SKILL TAGS SERVICE ==========

/**
 * Create a new skill tag
 * @param {Object} skillData - The skill tag data
 * @returns {Promise<string>} - The ID of the created skill tag
 */
export const createSkillTag = async (skillData) => {
  try {
    const skillRef = await addDoc(collection(db, 'skillTags'), {
      ...skillData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return skillRef.id;
  } catch (error) {
    console.error('Error creating skill tag:', error);
    throw error;
  }
};

/**
 * Get all skill tags
 * @returns {Promise<Array>} - Array of skill tags
 */
export const getAllSkillTags = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'skillTags'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting skill tags:', error);
    throw error;
  }
};

/**
 * Get skill tags by category
 * @param {string} category - The category to filter by
 * @returns {Promise<Array>} - Array of filtered skill tags
 */
export const getSkillTagsByCategory = async (category) => {
  try {
    const q = query(
      collection(db, 'skillTags'), 
      where('category', '==', category)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting skill tags by category:', error);
    throw error;
  }
};

// ========== QUESTIONS SERVICE ==========

/**
 * Create a new question with skill tags
 * @param {Object} questionData - The question data including skill tags
 * @returns {Promise<string>} - The ID of the created question
 */
export const createQuestion = async (questionData) => {
  try {
    // Normalize the question data to ensure subcategory is in kebab-case format
    const normalizedQuestion = normalizeQuestionData(questionData);
    
    // Store any numeric subcategoryId for legacy compatibility
    // but ensure the canonical kebab-case format is the primary identifier
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
 * Get questions by module
 * @param {string} moduleId - The module ID to filter by
 * @returns {Promise<Array>} - Array of questions for the module
 */
export const getQuestionsByModule = async (moduleId) => {
  try {
    const q = query(
      collection(db, 'questions'), 
      where('module', '==', moduleId)
    );
    const querySnapshot = await getDocs(q);
    // Normalize question data to ensure subcategory is in kebab-case format
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
 * Get questions by skill tag
 * @param {string} skillTagId - The skill tag ID to filter by
 * @returns {Promise<Array>} - Array of questions with the skill tag
 */
export const getQuestionsBySkillTag = async (skillTagId) => {
  try {
    const q = query(
      collection(db, 'questions'), 
      where('skillTags', 'array-contains', skillTagId)
    );
    const querySnapshot = await getDocs(q);
    // Normalize question data to ensure subcategory is in kebab-case format
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

// Note: The getQuestionsBySubcategory function has been consolidated and is now defined later in this file

// ========== USER PROGRESS SERVICE ==========

/**
 * Record a user's response to a question
 * @param {Object} progressData - The user progress data
 * @returns {Promise<string>} - The ID of the created progress record
 */
export const recordUserProgress = async (progressData) => {
  try {
    // Add the response to userProgress collection
    const progressRef = await addDoc(collection(db, 'userProgress'), {
      ...progressData,
      attemptedAt: serverTimestamp()
    });
    
    // Update the user's skill statistics
    if (progressData.skillTags && Array.isArray(progressData.skillTags)) {
      await updateUserSkillStats(progressData.userId, progressData.skillTags, progressData.isCorrect, progressData.timeSpent);
    }
    
    return progressRef.id;
  } catch (error) {
    console.error('Error recording user progress:', error);
    throw error;
  }
};

/**
 * Record a user's progress in an adaptive quiz
 * @param {string} userId - The user ID
 * @param {string} subcategory - The subcategory of the adaptive quiz
 * @param {number} level - The difficulty level
 * @param {boolean} passed - Whether the user passed the quiz
 * @param {Array<string>} [askedQuestions] - Optional array of question IDs that were asked
 * @returns {Promise<void>}
 * @deprecated Use updateSubcategoryProgress from progressUtils.js instead
 */
export const recordAdaptiveQuizProgress = async (userId, subcategory, level, passed, askedQuestions = []) => {
  console.warn(
    'DEPRECATED: recordAdaptiveQuizProgress is deprecated and will be removed in a future version. ' +
    'Use updateSubcategoryProgress from progressUtils.js instead.'
  );
  
  try {
    if (!userId || !subcategory) {
      console.warn('Missing required parameters for recordAdaptiveQuizProgress');
      return;
    }

    // Import the new progress utility function
    const { updateSubcategoryProgress } = await import('../utils/progressUtils');
    
    // For a 5-question quiz, calculate correct answers based on pass/fail
    // This matches the original implementation's estimation
    const questionCount = 5;
    const correctCount = passed ? Math.max(3, Math.floor(questionCount * 0.7)) : Math.floor(questionCount * 0.4);
    const score = Math.round((correctCount / questionCount) * 100);
    
    // Call the new unified function with the same data
    await updateSubcategoryProgress(
      userId,
      subcategory,
      level,
      score,
      passed,
      askedQuestions,
      { // Pass the quiz stats
        correct: correctCount,
        total: questionCount
      }
    );
    
    // Legacy support: Update the userStats collection for dashboard compatibility
    // This can be removed in a future version when all components use the new progress format
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
          lastAttemptAt: null
        };
        
        // Update with this quiz result
        subcategoryStat.correct += correctCount;
        subcategoryStat.total += questionCount;
        subcategoryStat.attempts += 1;
        subcategoryStat.lastAttemptAt = new Date();
        subcategoryStat.accuracy = Math.round((subcategoryStat.correct / subcategoryStat.total) * 100);
        
        // Save back to subcategoryStats
        subcategoryStats[subcategory] = subcategoryStat;
        
        // Update the document
        await updateDoc(userStatsRef, {
          subcategoryStats,
          updatedAt: serverTimestamp()
        });
      } else {
        // Create a new user stats document if it doesn't exist
        await setDoc(userStatsRef, {
          userId,
          subcategoryStats: {
            [subcategory]: {
              correct: correctCount,
              total: questionCount,
              attempts: 1,
              lastAttemptAt: new Date(),
              accuracy: Math.round((correctCount / questionCount) * 100)
            }
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    } catch (statsError) {
      console.error('Error updating legacy user stats:', statsError);
      // Continue even if the legacy stats update fails
    }
    
    console.log(`Recorded adaptive quiz progress for user ${userId} in subcategory ${subcategory}`);
  } catch (error) {
    console.error('Error recording adaptive quiz progress:', error);
    throw error;
  }
};

/**
 * Update a user's skill statistics
 * @param {string} userId - The user ID
 * @param {Array} skillTags - Array of skill tag IDs
 * @param {boolean} isCorrect - Whether the answer was correct
 * @param {number} timeSpent - Time spent on the question
 */
export const updateUserSkillStats = async (userId, skillTags, isCorrect, timeSpent) => {
  try {
    // Update stats for each skill tag
    for (const skillId of skillTags) {
      // Get existing stats or create new ones
      const statRef = doc(db, 'userSkillStats', `${userId}_${skillId}`);
      const statDoc = await getDoc(statRef);
      
      if (statDoc.exists()) {
        // Update existing stats
        const currentStats = statDoc.data();
        const totalAttempts = currentStats.totalAttempts + 1;
        const correctAttempts = isCorrect ? currentStats.correctAttempts + 1 : currentStats.correctAttempts;
        const accuracyRate = (correctAttempts / totalAttempts) * 100;
        const totalTimeSpent = currentStats.averageTimeSpent * currentStats.totalAttempts + timeSpent;
        const averageTimeSpent = totalTimeSpent / totalAttempts;
        
        await updateDoc(statRef, {
          totalAttempts,
          correctAttempts,
          accuracyRate,
          averageTimeSpent,
          lastUpdated: serverTimestamp()
        });
      } else {
        // Create new stats
        await setDoc(statRef, {
          id: `${userId}_${skillId}`,
          userId,
          skillId,
          totalAttempts: 1,
          correctAttempts: isCorrect ? 1 : 0,
          accuracyRate: isCorrect ? 100 : 0,
          averageTimeSpent: timeSpent,
          lastUpdated: serverTimestamp()
        });
      }
    }
  } catch (error) {
    console.error('Error updating user skill stats:', error);
    throw error;
  }
};

/**
 * Get a user's skill statistics
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} - Array of user skill statistics
 */
export const getUserSkillStats = async (userId) => {
  try {
    const q = query(
      collection(db, 'userSkillStats'), 
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user skill stats:', error);
    throw error;
  }
};

// ========== STUDY RESOURCES SERVICE ==========

/**
 * Create a new study resource
 * @param {Object} resourceData - The resource data
 * @returns {Promise<string>} - The ID of the created resource
 */
export const createStudyResource = async (resourceData) => {
  try {
    const resourceRef = await addDoc(collection(db, 'studyResources'), {
      ...resourceData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return resourceRef.id;
  } catch (error) {
    console.error('Error creating study resource:', error);
    throw error;
  }
};

/**
 * Get study resources by skill tag
 * @param {string} skillTagId - The skill tag ID to filter by
 * @returns {Promise<Array>} - Array of resources for the skill tag
 */
export const getResourcesBySkillTag = async (skillTagId) => {
  try {
    const q = query(
      collection(db, 'studyResources'), 
      where('skillTags', 'array-contains', skillTagId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting resources by skill tag:', error);
    throw error;
  }
};

/**
 * Get resources by main category
 * @param {string} mainCategory - The main category to filter by
 * @returns {Promise<Array>} - Array of resources for the main category
 */
export const getResourcesByMainCategory = async (mainCategory) => {
  try {
    const q = query(
      collection(db, 'studyResources'), 
      where('mainSkillCategory', '==', mainCategory),
      orderBy('qualityRating', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting resources by main category:', error);
    return [];
  }
};

/**
 * Get resources by subcategory
 * @param {string} subcategory - The subcategory to filter by
 * @returns {Promise<Array>} - Array of resources for the subcategory
 */
export const getResourcesBySubcategory = async (subcategory) => {
  try {
    const q = query(
      collection(db, 'studyResources'), 
      where('subSkillCategory', '==', subcategory),
      orderBy('qualityRating', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting resources by subcategory:', error);
    return [];
  }
};

/**
 * Get user attempt history (for analyzing subcategory performance)
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} - The user's attempt history
 */
export const getUserAttemptHistory = async (userId) => {
  try {
    const q = query(
      collection(db, 'questionAttempts'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      // Limit to the last 100 attempts to prevent performance issues
      limit(100)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user attempt history:', error);
    return [];
  }
};

// ========== TARGETED QUIZZES SERVICE (DEPRECATED) ==========

/**
 * Create a new targeted quiz
 * @param {Object} quizData - The quiz data
 * @returns {Promise<string>} - The ID of the created quiz
 * @deprecated Targeted Quizzes have been deprecated in favor of Adaptive Quizzes
 */
export const createTargetedQuiz = async (quizData) => {
  console.warn('createTargetedQuiz is deprecated. Use adaptive quizzes instead.');
  try {
    // Return a dummy ID instead of creating an actual quiz
    return 'deprecated-targeted-quiz';
  } catch (error) {
    console.error('Error in deprecated createTargetedQuiz:', error);
    throw error;
  }
};

/**
 * Get targeted quizzes by skill tag
 * @param {string} skillTagId - The skill tag ID to filter by
 * @returns {Promise<Array>} - Array of quizzes for the skill tag
 * @deprecated Targeted Quizzes have been deprecated in favor of Adaptive Quizzes
 */
export const getQuizzesBySkillTag = async (skillTagId) => {
  console.warn('getQuizzesBySkillTag is deprecated. Use adaptive quizzes instead.');
  // Return an empty array instead of querying the database
  return [];
};

/**
 * Get quizzes by main category
 * @param {string} mainCategory - The main category to filter by
 * @returns {Promise<Array>} - Array of quizzes for the main category
 * @deprecated Targeted Quizzes have been deprecated in favor of Adaptive Quizzes
 */
export const getQuizzesByMainCategory = async (mainCategory) => {
  console.warn('getQuizzesByMainCategory is deprecated. Use adaptive quizzes instead.');
  // Return an empty array instead of querying the database
  return [];
};

/**
 * Get quizzes by subcategory
 * @param {string} subcategory - The subcategory to filter by
 * @returns {Promise<Array>} - Array of quizzes for the subcategory
 * @deprecated Targeted Quizzes have been deprecated in favor of Adaptive Quizzes
 */
export const getQuizzesBySubcategory = async (subcategory) => {
  console.warn('getQuizzesBySubcategory is deprecated. Use adaptive quizzes instead.');
  // Return an empty array instead of querying the database
  return [];
};

// ========== USER RECOMMENDATIONS SERVICE ==========

/**
 * Generate and save recommendations for a user based on hierarchical SAT categories
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - The generated recommendations
 */
export const generateUserRecommendations = async (userId) => {
  try {
    // Get the user's skill statistics and attempt history
    const userSkillStats = await getUserSkillStats(userId);
    const attemptHistory = await getUserAttemptHistory(userId);
    
    // Calculate how many questions the user has answered in each category/subcategory
    const categoryAttemptCounts = {};
    const subcategoryAttemptCounts = {};
    
    // Group user skills by main and subcategories
    const mainCategoryStats = {};
    const subCategoryStats = {};
    
    attemptHistory.forEach(attempt => {
      // Track main category attempts
      if (attempt.mainSkillCategory) {
        categoryAttemptCounts[attempt.mainSkillCategory] = 
          (categoryAttemptCounts[attempt.mainSkillCategory] || 0) + 1;
      }
      
      // Track subcategory attempts
      if (attempt.subSkillCategory) {
        subcategoryAttemptCounts[attempt.subSkillCategory] = 
          (subcategoryAttemptCounts[attempt.subSkillCategory] || 0) + 1;
      }
    });
    
    // Process skill stats into main and subcategory groups
    userSkillStats.forEach(stat => {
      // If this stat has mainSkillCategory metadata
      if (stat.mainSkillCategory) {
        // Initialize main category stats if not exists
        if (!mainCategoryStats[stat.mainSkillCategory]) {
          mainCategoryStats[stat.mainSkillCategory] = {
            category: stat.mainSkillCategory,
            totalQuestions: 0,
            correctAnswers: 0,
            accuracyRate: 0
          };
        }
        
        // Update main category stats
        mainCategoryStats[stat.mainSkillCategory].totalQuestions += stat.totalQuestions;
        mainCategoryStats[stat.mainSkillCategory].correctAnswers += stat.correctAnswers;
      }
      
      // If this stat has subSkillCategory metadata
      if (stat.subSkillCategory) {
        // Initialize subcategory stats if not exists
        if (!subCategoryStats[stat.subSkillCategory]) {
          subCategoryStats[stat.subSkillCategory] = {
            category: stat.subSkillCategory,
            totalQuestions: 0,
            correctAnswers: 0,
            accuracyRate: 0,
            mainCategory: stat.mainSkillCategory
          };
        }
        
        // Update subcategory stats
        subCategoryStats[stat.subSkillCategory].totalQuestions += stat.totalQuestions;
        subCategoryStats[stat.subSkillCategory].correctAnswers += stat.correctAnswers;
      }
    });
    
    // Calculate accuracy rates for main categories
    Object.values(mainCategoryStats).forEach(stat => {
      stat.accuracyRate = stat.totalQuestions > 0 
        ? (stat.correctAnswers / stat.totalQuestions) * 100 
        : 0;
    });
    
    // Calculate accuracy rates for subcategories
    Object.values(subCategoryStats).forEach(stat => {
      stat.accuracyRate = stat.totalQuestions > 0 
        ? (stat.correctAnswers / stat.totalQuestions) * 100 
        : 0;
    });
    
    // Identify weak main categories (below 70% accuracy)
    const weakMainCategories = Object.values(mainCategoryStats)
      .filter(stat => stat.accuracyRate < 70 && stat.totalQuestions >= 3)
      .map(stat => stat.category);
    
    // Identify moderate main categories (70-85% accuracy)
    const moderateMainCategories = Object.values(mainCategoryStats)
      .filter(stat => stat.accuracyRate >= 70 && stat.accuracyRate <= 85 && stat.totalQuestions >= 3)
      .map(stat => stat.category);
    
    // Identify weak subcategories (below 70% accuracy)
    const weakSubcategories = Object.values(subCategoryStats)
      .filter(stat => stat.accuracyRate < 70 && stat.totalQuestions >= 2)
      .map(stat => stat.category);
    
    // Identify moderate subcategories (70-85% accuracy)
    const moderateSubcategories = Object.values(subCategoryStats)
      .filter(stat => stat.accuracyRate >= 70 && stat.accuracyRate <= 85 && stat.totalQuestions >= 2)
      .map(stat => stat.category);
    
    // Determine what level of recommendations to provide
    const hasEnoughMainCategoryData = Object.values(mainCategoryStats).some(stat => stat.totalQuestions >= 3);
    const hasEnoughSubCategoryData = Object.values(subCategoryStats).some(stat => stat.totalQuestions >= 2);
    
    // Get recommended quizzes using appropriate levels
    const recommendedQuizzes = [];
    
    // First prioritize weak subcategories if there's enough data
    if (hasEnoughSubCategoryData && weakSubcategories.length > 0) {
      for (const subcategory of weakSubcategories) {
        const quizzes = await getQuizzesBySubcategory(subcategory);
        recommendedQuizzes.push(...quizzes.slice(0, 2).map(quiz => quiz.id));
      }
    } 
    // Then use main categories if there's enough data or not enough subcategory quizzes
    if ((hasEnoughMainCategoryData && weakMainCategories.length > 0) || recommendedQuizzes.length < 2) {
      for (const category of weakMainCategories) {
        const quizzes = await getQuizzesByMainCategory(category);
        recommendedQuizzes.push(...quizzes.slice(0, 2).map(quiz => quiz.id));
      }
    }
    
    // If still need more recommendations, look at moderate categories
    if (recommendedQuizzes.length < 3) {
      if (hasEnoughSubCategoryData && moderateSubcategories.length > 0) {
        for (const subcategory of moderateSubcategories) {
          const quizzes = await getQuizzesBySubcategory(subcategory);
          recommendedQuizzes.push(...quizzes.slice(0, 1).map(quiz => quiz.id));
        }
      }
      
      if (recommendedQuizzes.length < 3 && hasEnoughMainCategoryData && moderateMainCategories.length > 0) {
        for (const category of moderateMainCategories) {
          const quizzes = await getQuizzesByMainCategory(category);
          recommendedQuizzes.push(...quizzes.slice(0, 1).map(quiz => quiz.id));
        }
      }
    }
    
    // Limit to max 5 quiz recommendations
    const finalRecommendedQuizzes = [...new Set(recommendedQuizzes)].slice(0, 5);
    
    // Get recommended resources for weak skills
    const recommendedResources = [];
    
    // Start with subcategory resources if available
    if (hasEnoughSubCategoryData && weakSubcategories.length > 0) {
      for (const subcategory of weakSubcategories) {
        const resources = await getResourcesBySubcategory(subcategory);
        recommendedResources.push(...resources.slice(0, 1).map(resource => resource.id));
      }
    }
    
    // Add main category resources if needed
    if (recommendedResources.length < 3 && hasEnoughMainCategoryData && weakMainCategories.length > 0) {
      for (const category of weakMainCategories) {
        const resources = await getResourcesByMainCategory(category);
        recommendedResources.push(...resources.slice(0, 1).map(resource => resource.id));
      }
    }
    
    // Limit to max 5 resource recommendations
    const finalRecommendedResources = [...new Set(recommendedResources)].slice(0, 5);
    
    // Generate a personalized feedback message
    let feedback = 'Based on your performance, ';
    
    if (hasEnoughSubCategoryData && weakSubcategories.length > 0) {
      // More specific feedback using subcategories
      feedback += `we recommend focusing on improving your skills in these specific areas: ${weakSubcategories.join(', ')}. `;
    } else if (hasEnoughMainCategoryData && weakMainCategories.length > 0) {
      // Broader feedback using main categories
      feedback += `we recommend focusing on improving your skills in these areas: ${weakMainCategories.join(', ')}. `;
    } else if (hasEnoughSubCategoryData && moderateSubcategories.length > 0) {
      feedback += `you're doing well but could improve in these specific areas: ${moderateSubcategories.join(', ')}. `;
    } else if (hasEnoughMainCategoryData && moderateMainCategories.length > 0) {
      feedback += `you're doing well but could improve in these areas: ${moderateMainCategories.join(', ')}. `;
    } else {
      feedback += `you're performing very well across all skills! Consider challenging yourself with more advanced material. `;
    }
    
    // If not enough data, add encouragement to practice more
    if (!hasEnoughMainCategoryData && !hasEnoughSubCategoryData) {
      feedback = 'Complete more practice questions to receive personalized recommendations based on your performance patterns.';
    }
    
    // Save the recommendations
    const recommendationsData = {
      userId,
      weakMainCategories,
      moderateMainCategories,
      weakSubcategories,
      moderateSubcategories,
      recommendedQuizzes: finalRecommendedQuizzes,
      recommendedResources: finalRecommendedResources,
      hasEnoughMainCategoryData,
      hasEnoughSubCategoryData,
      feedback,
      generatedAt: serverTimestamp()
    };
    
    const recommendationsRef = await addDoc(collection(db, 'userRecommendations'), recommendationsData);
    
    return {
      id: recommendationsRef.id,
      ...recommendationsData
    };
  } catch (error) {
    console.error('Error generating user recommendations:', error);
    throw error;
  }
};

/**
 * Get the latest recommendations for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - The latest recommendations
 */
export const getLatestUserRecommendations = async (userId) => {
  try {
    const q = query(
      collection(db, 'userRecommendations'), 
      where('userId', '==', userId),
      orderBy('generatedAt', 'desc'),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    return {
      id: querySnapshot.docs[0].id,
      ...querySnapshot.docs[0].data()
    };
  } catch (error) {
    console.error('Error getting latest user recommendations:', error);
    throw error;
  }
};

// ========== EXAM MODULES SERVICE ==========

/**
 * Create a new exam module
 * @param {Object} moduleData - The module data
 * @returns {Promise<string>} - The ID of the created module
 */
export const createExamModule = async (moduleData) => {
  try {
    // Ensure we have valid data structure
    const validatedData = {
      ...moduleData,
      title: moduleData.title || 'Untitled Module',
      description: moduleData.description || 'No description provided',
      questionIds: moduleData.questionIds || [],
      moduleNumber: moduleData.moduleNumber || 1,
      calculatorAllowed: moduleData.calculatorAllowed !== undefined ? moduleData.calculatorAllowed : false,
      timeLimit: moduleData.timeLimit || 1920, // 32 minutes default
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
 * Get all exam modules
 * @returns {Promise<Array>} - Array of exam modules
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
 * Get an exam module by ID
 * @param {string} moduleId - The module ID
 * @returns {Promise<Object>} - The exam module
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
 * Get an exam module by number
 * @param {number} moduleNumber - The module number (1-4)
 * @returns {Promise<Object>} - The exam module
 */
export const getExamModuleByNumber = async (moduleNumber) => {
  try {
    // Remove the orderBy to avoid requiring a composite index
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
 * Get questions for an exam module
 * @param {string} moduleId - The module ID
 * @returns {Promise<Array>} - Array of questions for the module
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
 * Get questions by category path
 * @param {string} categoryPath - The category path to filter by
 * @returns {Promise<Array>} - Array of questions in the category
 */
export const getQuestionsByCategory = async (categoryPath) => {
  try {
    // Query questions by exact category path
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
 * Get most recent questions, sorted by creation date
 * @param {number} maxResults - The maximum number of questions to return
 * @returns {Promise<Array>} - Array of questions sorted by creation date (newest first)
 */
export const getRecentQuestions = async (maxResults = 100) => {
  try {
    console.log('Fetching recent questions, limit:', maxResults);
    
    // Try a simpler approach first - just get all questions
    const allQuestionsQuery = query(
      collection(db, 'questions'),
      limit(maxResults)
    );
    
    console.log('Executing query for all questions');
    const snapshot = await getDocs(allQuestionsQuery);
    
    // Log the results
    console.log(`Found ${snapshot.docs.length} questions total`);
    
    // Process all questions
    let questions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort questions by createdAt date if available, otherwise keep the original order
    questions.sort((a, b) => {
      // If both have createdAt, compare them
      if (a.createdAt && b.createdAt) {
        // Convert to milliseconds if they are Firestore timestamps
        const aTime = a.createdAt.toMillis ? a.createdAt.toMillis() : a.createdAt;
        const bTime = b.createdAt.toMillis ? b.createdAt.toMillis() : b.createdAt;
        return bTime - aTime; // Descending (newest first)
      }
      // If only a has createdAt, it comes first
      else if (a.createdAt) return -1;
      // If only b has createdAt, it comes first
      else if (b.createdAt) return 1;
      // If neither has createdAt, maintain the order they came in
      return 0;
    });
    
    console.log('Successfully sorted questions by date');
    return questions;
    
  } catch (error) {
    console.error('Error getting recent questions:', error);
    // Return an empty array instead of throwing to avoid breaking the UI
    return [];
  }
};

/**
 * Get questions by subcategory
 * @param {string} subcategory - The subcategory to filter by (any format)
 * @param {string} [difficulty] - Optional difficulty level filter
 * @param {number} [limitCount=50] - Optional limit on number of results
 * @returns {Promise<Array>} - Array of questions with the specified subcategory
 */
export const getQuestionsBySubcategory = async (subcategory, difficulty = null, limitCount = 50) => {
  try {
    // First, ensure subcategory is in kebab-case format (canonical identifier)
    const kebabSubcategory = getKebabCaseFromAnyFormat(subcategory);
    
    if (!kebabSubcategory) {
      console.warn(`Could not convert subcategory to kebab-case: ${subcategory}`);
      return [];
    }
    
    console.log(`Fetching questions for subcategory: ${subcategory} (normalized to: ${kebabSubcategory})`);
    
    // Create query objects with various formats to handle the transition period
    // The queries are ordered by priority, with kebab-case being the canonical format
    const queryObjects = [];
    
    // 1. Primary query: kebab-case format (canonical identifier)
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
    
    // 2. Legacy format: Title Case (e.g., "Inferences" instead of "inferences")
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
    
    // 3. Legacy format: numeric subcategoryId
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
    
    // 4. Legacy format: alternate field name 'subCategory'
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
    
    // 5. Legacy format: categoryPath array
    const categoryPathQuery = query(
      collection(db, 'questions'),
      where('categoryPath', 'array-contains', kebabSubcategory),
      limit(limitCount)
    );
    
    queryObjects.push({ type: 'category-path', query: categoryPathQuery });
    
    // Execute queries in order of priority and return first set of results
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
    
    // Normalize all questions to ensure consistent subcategory format
    let questions = normalizeQuestions(Object.values(resultsMap));
    
    // TEMPORARILY DISABLED: Allow all questions regardless of usageContext
    // This will help diagnose the context issue
    // TODO: Re-enable filtering after fixing the context values
    // questions = questions.filter(q => !q.usageContext || q.usageContext === 'general');
    
    console.log(`[getQuestionsBySubcategory] Returning ${questions.length} questions (context filter disabled)`);
    if (questions.length > 0) {
      console.log(`[getQuestionsBySubcategory] Sample question contexts:`, 
        questions.slice(0, 3).map(q => ({ id: q.id, usageContext: q.usageContext })));
    }
    
    return questions;
  } catch (error) {
    console.error(`Error getting questions for subcategory ${subcategory}:`, error);
    throw error;
  }
};

/**
 * Enrich a question with new category information
 * @param {Object} question - The question to enrich
 * @returns {Object} - The enriched question
 */
export const enrichQuestionWithNewCategories = (question) => {
  // If question already has a proper categoryPath, return as is
  if (question.categoryPath && question.subcategory) {
    return question;
  }
  
  // Standard SAT category mappings
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
  
  // Initialize category path and subcategory
  let categoryPath = '';
  let mainCategory = '';
  let subcategory = question.subcategory || question.subCategory || '';
  let subjectArea = '';
  
  // Determine subject area and main category based on existing information
  if (question.mainSkillCategory) {
    // Determine the main subject area
    if (['Algebra', 'Advanced Math', 'Problem-Solving and Data Analysis', 'Geometry and Trigonometry'].includes(question.mainSkillCategory)) {
      subjectArea = 'Math';
      mainCategory = question.mainSkillCategory;
    } else {
      subjectArea = 'Reading and Writing';
      // Attempt to map to a main category
      for (const [category, subcats] of Object.entries(readingWritingMainCategories)) {
        if (subcats.includes(question.mainSkillCategory)) {
          mainCategory = category;
          break;
        }
      }
    }
  } else if (question.category) {
    // Legacy category handling (numeric)
    if ([1, 2].includes(Number(question.category))) {
      subjectArea = 'Reading and Writing';
    } else if ([3, 4].includes(Number(question.category))) {
      subjectArea = 'Math';
    }
  }
  
  // If we have a subcategory but no subject area, try to determine it
  if (subcategory && !subjectArea) {
    // Check if it's a math subcategory
    let found = false;
    for (const [category, subcats] of Object.entries(mathMainCategories)) {
      if (subcats.includes(subcategory)) {
        subjectArea = 'Math';
        mainCategory = category;
        found = true;
        break;
      }
    }
    
    // If not found in math, check reading/writing
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
  
  // Construct the category path
  if (subjectArea && mainCategory && subcategory) {
    categoryPath = `${subjectArea}/${mainCategory}/${subcategory}`;
  } else if (subjectArea && mainCategory) {
    categoryPath = `${subjectArea}/${mainCategory}`;
  } else if (subjectArea) {
    categoryPath = subjectArea;
  }
  
  // Ensure question has skill tags
  const skillTags = question.skillTags || [];
  
  // Return enriched question
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
 * Generate an exam module based on criteria
 * @param {Object} options - Module generation options
 * @param {string} options.title - Module title
 * @param {string} options.description - Module description
 * @param {number} options.moduleNumber - Module number (1-4)
 * @param {boolean} options.calculatorAllowed - Whether calculators are allowed
 * @param {Array} options.categoryPaths - Array of category paths to filter by
 * @param {number} options.questionCount - Number of questions to include
 * @param {Object} options.difficultyRange - Range of difficulty (min, max)
 * @param {number} options.timeLimit - Time limit in seconds
 * @returns {Promise<string>} - The ID of the generated module
 */
export const generateExamModule = async ({
  title,
  description,
  moduleNumber,
  calculatorAllowed,
  categoryPaths = [],
  questionCount = 27,
  difficultyRange = { min: 1, max: 5 },
  timeLimit = 1920 // 32 minutes
}) => {
  try {
    // Prepare the query
    let questionQuery = null;
    
    // If no specific categories, filter by module number
    if (!categoryPaths || categoryPaths.length === 0) {
      // For modules 1-2, use Reading and Writing
      // For modules 3-4, use Math
      const subjectPrefix = (moduleNumber <= 2) ? 'Reading and Writing' : 'Math';
      
      questionQuery = query(
        collection(db, 'questions'),
        where('categoryPath', '>=', subjectPrefix),
        where('categoryPath', '<', subjectPrefix + '\uf8ff') // End of range
      );
    } else {
      // Use provided category paths
      // Firestore doesn't support OR queries across different fields
      // We have to do multiple queries and combine the results
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
        
        // Enrich each question with category/subcategory info
        const enrichedBatchQuestions = batchQuestions.map(enrichQuestionWithNewCategories);
        
        allQuestions = [...allQuestions, ...enrichedBatchQuestions]; // <-- Use enriched data
      }
      
      // Filter by difficulty
      allQuestions = allQuestions.filter(q => {
        const difficulty = q.difficulty || 3; // Default to medium if not specified
        return difficulty >= difficultyRange.min && difficulty <= difficultyRange.max;
      });
      
      // Shuffle and take the requested number
      const shuffled = allQuestions.sort(() => 0.5 - Math.random());
      const selectedQuestions = shuffled.slice(0, questionCount);
      
      // Create the module
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
    
    // If we used the query approach (for no category paths)
    if (questionQuery) {
      const querySnapshot = await getDocs(questionQuery);
      let questions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filter by difficulty
      questions = questions.filter(q => {
        const difficulty = q.difficulty || 3; // Default to medium if not specified
        return difficulty >= difficultyRange.min && difficulty <= difficultyRange.max;
      });
      
      // Shuffle and take the requested number
      const shuffled = questions.sort(() => 0.5 - Math.random());
      const selectedQuestions = shuffled.slice(0, questionCount);
      
      // Create the module
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
 * Get questions by IDs
 * @param {Array} questionIds - Array of question IDs
 * @returns {Promise<Array>} - Array of questions
 */
export const getQuestionsByIds = async (questionIds) => {
  try {
    if (!questionIds || questionIds.length === 0) {
      return [];
    }
    
    // Firestore has a limit on 'in' queries (usually 10 items)
    // Split into batches if needed
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < questionIds.length; i += batchSize) {
      const batch = questionIds.slice(i, i + batchSize);
      batches.push(batch);
    }
    
    // Execute each batch query
    let allQuestions = [];
    
    for (const batch of batches) {
      const q = query(
        collection(db, 'questions'),
        where('__name__', 'in', batch) // Use document ID
      );
      
      const querySnapshot = await getDocs(q);
      const batchQuestions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Enrich each question with category/subcategory info
      const enrichedBatchQuestions = batchQuestions.map(enrichQuestionWithNewCategories);
      
      allQuestions = [...allQuestions, ...enrichedBatchQuestions]; // <-- Use enriched data
    }
    
    // Ensure questions are returned in the same order as questionIds
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

/**
 * Update an exam module
 * @param {string} moduleId - The module ID
 * @param {Object} moduleData - The updated module data
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
 * Delete an exam module
 * @param {string} moduleId - The module ID to delete
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

// ========== PRACTICE EXAMS SERVICE ==========

/**
 * Utility function to repair broken data in practice exams and modules
 * This will create empty placeholder module and exam if none exist
 * @returns {Promise<Object>} - Details of what was repaired
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
    
    // Check for existing modules
    const moduleSnapshot = await getDocs(collection(db, 'examModules'));
    results.examModulesFound = moduleSnapshot.docs.length;
    
    // Check for existing practice exams
    const examSnapshot = await getDocs(collection(db, 'practiceExams'));
    results.practiceExamsFound = examSnapshot.docs.length;
    
    console.log(`Found ${results.examModulesFound} modules and ${results.practiceExamsFound} practice exams`);
    
    // Create a placeholder module if none exist
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
        
        // Create a placeholder practice exam using the new module
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
      // If we have modules but no exams, create a placeholder exam with the first module
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
 * Create a new practice exam composed of existing modules
 * @param {Object} examData - The practice exam data
 * @param {string} examData.title - The title of the practice exam
 * @param {string} examData.description - The description of the practice exam
 * @param {Array} examData.moduleIds - Array of module IDs included in this exam
 * @param {boolean} examData.isPublic - Whether the exam is publicly available
 * @returns {Promise<string>} - The ID of the created practice exam
 */
export const createPracticeExam = async (examData) => {
  try {
    // Validate that all moduleIds exist before creating the exam
    const moduleIds = examData.moduleIds || [];
    
    // Check for empty moduleIds array
    if (moduleIds.length === 0) {
      throw new Error('Practice exam must include at least one module');
    }
    
    console.log('Validating modules for practice exam creation...');
    // Verify that all moduleIds exist
    for (const moduleId of moduleIds) {
      const moduleRef = doc(db, 'examModules', moduleId);
      const moduleSnap = await getDoc(moduleRef);
      if (!moduleSnap.exists()) {
        throw new Error(`Module with ID ${moduleId} does not exist`);
      }
    }
    
    // Ensure we have valid data structure
    const validatedData = {
      ...examData,
      title: examData.title || 'Untitled Practice Exam',
      description: examData.description || 'No description provided',
      moduleIds: moduleIds,
      isPublic: examData.isPublic !== undefined ? examData.isPublic : true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Create the practice exam
    const examRef = await addDoc(collection(db, 'practiceExams'), validatedData);
    console.log('Created new practice exam with ID:', examRef.id);
    return examRef.id;
  } catch (error) {
    console.error('Error creating practice exam:', error);
    throw error;
  }
};

/**
 * Get all practice exams
 * @param {boolean} publicOnly - Whether to return only public exams
 * @returns {Promise<Array>} - Array of practice exams
 */
export const getAllPracticeExams = async (onlyPublic = false) => {
  try {
    let examQuery;
    
    if (onlyPublic) {
      // Only fetch public exams
      examQuery = query(
        collection(db, 'practiceExams'),
        where('isPublic', '==', true)
      );
    } else {
      // Fetch all exams
      examQuery = collection(db, 'practiceExams');
    }
    
    const querySnapshot = await getDocs(examQuery);
    const exams = [];
    
    querySnapshot.forEach((doc) => {
      exams.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return exams;
  } catch (error) {
    console.error('Error getting practice exams:', error);
    throw error;
  }
};



/**
 * Get a practice exam by ID
 * @param {string} examId - The practice exam ID
 * @returns {Promise<Object>} - The practice exam data
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
 * Get all modules for a practice exam
 * @param {string} examId - The practice exam ID
 * @returns {Promise<Array>} - Array of exam modules with their questions
 */
export const getPracticeExamModules = async (examId) => {
  try {
    // Get the practice exam to retrieve module IDs
    const exam = await getPracticeExamById(examId);
    const moduleIds = exam.moduleIds || [];
    
    if (moduleIds.length === 0) {
      return [];
    }
    
    // Get each module
    const modules = [];
    let moduleIndex = 0;
    
    for (const moduleId of moduleIds) {
      try {
        // Get the module information
        const module = await getExamModuleById(moduleId);
        
        // Get the questions for this module
        let questions = [];
        if (module.questionIds && Array.isArray(module.questionIds)) {
          // Fetch each question directly from the questions collection
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
        
        // Enrich questions with categories if needed
        const enrichedQuestions = questions.map(q => {
          if (typeof enrichQuestionWithNewCategories === 'function') {
            return enrichQuestionWithNewCategories(q);
          }
          return q;
        });
        
        // Add this module with its questions to the result
        modules.push({
          ...module,
          questions: enrichedQuestions,
          moduleIndex: moduleIndex++ // Add index for ordering
        });
        
        console.log(`Loaded module ${module.title || moduleId} with ${enrichedQuestions.length} questions`);
      } catch (error) {
        console.warn(`Could not retrieve module ${moduleId}:`, error);
        // Continue with other modules even if one fails
      }
    }
    
    // Sort modules by their index
    modules.sort((a, b) => a.moduleIndex - b.moduleIndex);
    return modules;
  } catch (error) {
    console.error('Error getting practice exam modules:', error);
    throw error;
  }
};

/**
 * Update a practice exam
 * @param {string} examId - The practice exam ID
 * @param {Object} examData - The updated exam data
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
 * Delete a practice exam
 * @param {string} examId - The practice exam ID
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
