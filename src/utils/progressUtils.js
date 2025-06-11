/**
 * Progress Tracking Utilities
 * 
 * Functions to track and update user progress across the unified learning track,
 * handling both subcategory-level mastery and concept-level mastery.
 */

import { db } from '../firebase/config';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  collection,
  getDocs,
  arrayUnion,
  runTransaction
} from 'firebase/firestore';
import { normalizeSubcategoryName } from './subcategoryUtils';

/**
 * Maximum number of questions to keep in the askedQuestions array
 * to prevent excessive growth of the document
 */
const MAX_ASKED_QUESTIONS = 200;

/**
 * Gets a user's progress for a specific subcategory
 * 
 * @param {string} userId - User ID
 * @param {string} subcategoryId - Subcategory ID (will be normalized)
 * @returns {Promise<Object>} - Progress data including level, mastered status, and askedQuestions
 */
export const getSubcategoryProgress = async (userId, subcategoryId) => {
  try {
    if (!userId || !subcategoryId) {
      console.error('Missing required parameters for getSubcategoryProgress');
      return null;
    }

    const normalizedSubcategoryId = normalizeSubcategoryName(subcategoryId);
    const progressRef = doc(db, 'users', userId, 'progress', normalizedSubcategoryId);
    
    const progressDoc = await getDoc(progressRef);
    
    if (progressDoc.exists()) {
      const data = progressDoc.data();
      let accuracyLast10 = 0;
      const last10Results = data.last10QuestionResults || [];
      if (last10Results.length > 0) {
        const correctInLast10 = last10Results.filter(result => result === true).length;
        accuracyLast10 = Math.round((correctInLast10 / last10Results.length) * 100);
      }
      
      return {
        id: progressDoc.id,
        ...data,
        totalQuestionsAnswered: data.totalQuestions || 0,
        accuracyLast10: accuracyLast10,
        last10QuestionResultsCount: last10Results.length, // Useful for UI to know how many questions the accuracy is based on
        exists: true
      };
    }
    
    return {
      exists: false,
      level: 1,
      mastered: false,
      askedQuestions: [],
      totalQuestionsAnswered: 0,
      accuracyLast10: 0,
      last10QuestionResultsCount: 0,
      last10QuestionResults: [] // Initialize for new progress docs
    };
  } catch (error) {
    console.error('Error getting subcategory progress:', error);
    return {
      exists: false,
      level: 1,
      mastered: false,
      askedQuestions: [],
      totalQuestionsAnswered: 0,
      accuracyLast10: 0,
      last10QuestionResultsCount: 0,
      last10QuestionResults: []
    };
  }
};

/**
 * Updates a user's progress for a subcategory after completing an adaptive quiz
 * 
 * @param {string} userId - User ID
 * @param {string} subcategoryId - Subcategory ID (will be normalized)
 * @param {number} level - Current level (1-3)
 * @param {number} score - Score achieved (percentage, 0-100)
 * @param {boolean} passed - Whether the user passed the level
 * @param {Array<string>} [newAskedQuestions] - Question IDs to add to the askedQuestions list
 * @param {Object} [quizStats] - Additional quiz statistics (correct, total questions)
 * @param {Object} [questionResults] - Object with questionId keys and boolean values indicating if each question was answered correctly
 * @returns {Promise<{success: boolean, newLevel: number, passed: boolean, error: Error}>} Returns the success status, new level, and whether user passed
 */
export const updateSubcategoryProgress = async (userId, subcategoryId, level, score, passed, newAskedQuestions = [], quizStats = null, questionResults = null) => {
  // Store original level and passed state for fallback return in case of total failure
  const originalLevelForFallback = level;
  const originalPassedForFallback = passed;

  try {
    if (!userId || !subcategoryId) {
      console.error('Missing required parameters for updateSubcategoryProgress');
      // Return failure, using original level and passed state
      return { success: false, error: new Error('Missing parameters'), newLevel: originalLevelForFallback, passed: originalPassedForFallback };
    }

    const normalizedSubcategoryId = normalizeSubcategoryName(subcategoryId);
    const progressRef = doc(db, 'users', userId, 'progress', normalizedSubcategoryId);
    
    let calculatedNewLevelForReturn = passed && level < 3 ? level + 1 : level; // Optimistic calculation for return

    // Determine the results of newly answered questions in order
    const newlyAnsweredResults = newAskedQuestions
      .map(qId => questionResults ? questionResults[qId] : undefined)
      .filter(result => typeof result === 'boolean');

    // First try direct read + update approach
    try {
      const progressDoc = await getDoc(progressRef);
      let newLevel = level;
      let mastered = false;
      let updatedStats = {};
      let currentAskedQuestions = progressDoc.exists() ? (progressDoc.data().askedQuestions || []) : [];
      let currentMissedQuestions = progressDoc.exists() ? (progressDoc.data().missedQuestions || []) : [];
      let currentLast10Results = progressDoc.exists() ? (progressDoc.data().last10QuestionResults || []) : [];
      let finalAskedQuestions = currentAskedQuestions;
      
      // Update missed questions if we have question results
      let finalMissedQuestions = currentMissedQuestions;
      if (questionResults && Object.keys(questionResults).length > 0) {
        // Remove correctly answered questions from missedQuestions
        const correctlyAnswered = Object.entries(questionResults)
          .filter(([_, isCorrect]) => isCorrect)
          .map(([qId, _]) => qId);
        
        // Add incorrectly answered questions to missedQuestions
        const incorrectlyAnswered = Object.entries(questionResults)
          .filter(([_, isCorrect]) => !isCorrect)
          .map(([qId, _]) => qId);
        
        // Filter out correctly answered from missed questions
        finalMissedQuestions = currentMissedQuestions
          .filter(id => !correctlyAnswered.includes(id));
        
        // Add new incorrectly answered questions
        finalMissedQuestions = [...new Set([...finalMissedQuestions, ...incorrectlyAnswered])];
      }
      
      if (newAskedQuestions && newAskedQuestions.length > 0) {
          const combined = [...new Set([...currentAskedQuestions, ...newAskedQuestions])];
          finalAskedQuestions = combined.length > MAX_ASKED_QUESTIONS ? combined.slice(-MAX_ASKED_QUESTIONS) : combined;
      }

      // Update last10QuestionResults
      const updatedLast10Results = [...newlyAnsweredResults, ...currentLast10Results];
      const finalLast10Results = updatedLast10Results.slice(0, 10);

      if (progressDoc.exists()) {
        const progressData = progressDoc.data();
        newLevel = passed && level < 3 ? level + 1 : level;
        newLevel = Math.max(newLevel, progressData.level || 1);
        mastered = (level === 3 && passed) || (progressData.mastered || false);
        if (quizStats && typeof quizStats.correct === 'number' && typeof quizStats.total === 'number') {
          const currentCorrect = progressData.correctTotal || 0;
          const currentTotal = progressData.totalQuestions || 0;
          updatedStats = {
            correctTotal: currentCorrect + quizStats.correct,
            totalQuestions: currentTotal + quizStats.total,
            accuracy: Math.round(((currentCorrect + quizStats.correct) / (currentTotal + quizStats.total)) * 100), // Overall accuracy
            attempts: (progressData.attempts || 0) + 1
          };
        }
        await updateDoc(progressRef, {
          level: newLevel,
          lastScore: score,
          lastAttemptDate: serverTimestamp(),
          mastered: mastered,
          lastUpdated: serverTimestamp(),
          askedQuestions: finalAskedQuestions,
          missedQuestions: finalMissedQuestions,
          last10QuestionResults: finalLast10Results, // Store the last 10 results
          ...updatedStats
        });
      } else {
        newLevel = passed && level < 3 ? level + 1 : level;
        mastered = level === 3 && passed;
        const newDocData = {
          level: newLevel,
          lastScore: score,
          lastAttemptDate: serverTimestamp(),
          mastered: mastered,
          conceptMastery: {},
          askedQuestions: finalAskedQuestions,
          missedQuestions: finalMissedQuestions,
          lastUpdated: serverTimestamp()
        };
        if (quizStats && typeof quizStats.correct === 'number' && typeof quizStats.total === 'number') {
          newDocData.correctTotal = quizStats.correct;
          newDocData.totalQuestions = quizStats.total;
          newDocData.accuracy = Math.round((quizStats.correct / quizStats.total) * 100); // Overall accuracy
          newDocData.attempts = 1;
        }
        newDocData.last10QuestionResults = finalLast10Results; // Store the last 10 results for new doc
        await setDoc(progressRef, newDocData);
      }
      calculatedNewLevelForReturn = newLevel; // Actual new level after DB ops
      return { success: true, newLevel: calculatedNewLevelForReturn, passed };
    } catch (directUpdateError) {
      console.warn('Direct update failed, falling back to transaction:', directUpdateError);
      let attempts = 0;
      const maxAttempts = 3;
      let lastTransactionError = directUpdateError;
      
      while (attempts < maxAttempts) {
        try {
          const result = await runTransaction(db, async (transaction) => {
            const progressDocTx = await transaction.get(progressRef);
            let newLevelTx = level;
            let masteredTx = false;
            let updatedStatsTx = {};
            let currentAskedQuestionsTx = progressDocTx.exists() ? (progressDocTx.data().askedQuestions || []) : [];
            let currentMissedQuestionsTx = progressDocTx.exists() ? (progressDocTx.data().missedQuestions || []) : [];
            let currentLast10ResultsTx = progressDocTx.exists() ? (progressDocTx.data().last10QuestionResults || []) : [];
            
            // Update missed questions if we have question results in transaction
            let finalMissedQuestionsTx = currentMissedQuestionsTx;
            if (questionResults && Object.keys(questionResults).length > 0) {
              // Remove correctly answered questions from missedQuestions
              const correctlyAnsweredTx = Object.entries(questionResults)
                .filter(([_, isCorrect]) => isCorrect)
                .map(([qId, _]) => qId);
              
              // Add incorrectly answered questions to missedQuestions
              const incorrectlyAnsweredTx = Object.entries(questionResults)
                .filter(([_, isCorrect]) => !isCorrect)
                .map(([qId, _]) => qId);
              
              // Filter out correctly answered from missed questions
              finalMissedQuestionsTx = currentMissedQuestionsTx
                .filter(id => !correctlyAnsweredTx.includes(id));
              
              // Add new incorrectly answered questions
              finalMissedQuestionsTx = [...new Set([...finalMissedQuestionsTx, ...incorrectlyAnsweredTx])];
            }
            
            let finalAskedQuestionsTx = currentAskedQuestionsTx;
            if (newAskedQuestions && newAskedQuestions.length > 0) {
                const combinedTx = [...new Set([...currentAskedQuestionsTx, ...newAskedQuestions])];
                finalAskedQuestionsTx = combinedTx.length > MAX_ASKED_QUESTIONS ? combinedTx.slice(-MAX_ASKED_QUESTIONS) : combinedTx;
            }

            // Update last10QuestionResults
            const updatedLast10ResultsTx = [...newlyAnsweredResults, ...currentLast10ResultsTx];
            const finalLast10ResultsTx = updatedLast10ResultsTx.slice(0, 10);

            if (progressDocTx.exists()) {
              const progressDataTx = progressDocTx.data();
              newLevelTx = passed && level < 3 ? level + 1 : level;
              newLevelTx = Math.max(newLevelTx, progressDataTx.level || 1);
              masteredTx = (level === 3 && passed) || (progressDataTx.mastered || false);
              if (quizStats && typeof quizStats.correct === 'number' && typeof quizStats.total === 'number') {
                const currentCorrectTx = progressDataTx.correctTotal || 0;
                const currentTotalTx = progressDataTx.totalQuestions || 0;
                updatedStatsTx = {
                  correctTotal: currentCorrectTx + quizStats.correct,
                  totalQuestions: currentTotalTx + quizStats.total,
                  accuracy: Math.round(((currentCorrectTx + quizStats.correct) / (currentTotalTx + quizStats.total)) * 100), // Overall accuracy
                  attempts: (progressDataTx.attempts || 0) + 1
                };
              }
              transaction.update(progressRef, {
                level: newLevelTx,
                lastScore: score,
                lastAttemptDate: serverTimestamp(),
                mastered: masteredTx,
                lastUpdated: serverTimestamp(),
                askedQuestions: finalAskedQuestionsTx,
                missedQuestions: finalMissedQuestionsTx,
                last10QuestionResults: finalLast10ResultsTx, // Store the last 10 results
                ...updatedStatsTx
              });
            } else {
              newLevelTx = passed && level < 3 ? level + 1 : level;
              masteredTx = level === 3 && passed;
              const newDocDataTx = {
                level: newLevelTx,
                lastScore: score,
                lastAttemptDate: serverTimestamp(),
                mastered: masteredTx,
                conceptMastery: {},
                askedQuestions: finalAskedQuestionsTx,
                missedQuestions: finalMissedQuestionsTx,
                lastUpdated: serverTimestamp()
              };
              if (quizStats && typeof quizStats.correct === 'number' && typeof quizStats.total === 'number') {
                newDocDataTx.correctTotal = quizStats.correct;
                newDocDataTx.totalQuestions = quizStats.total;
                newDocDataTx.accuracy = Math.round((quizStats.correct / quizStats.total) * 100); // Overall accuracy
                newDocDataTx.attempts = 1;
              }
              newDocDataTx.last10QuestionResults = finalLast10ResultsTx; // Store the last 10 results for new doc
              transaction.set(progressRef, newDocDataTx);
            }
            calculatedNewLevelForReturn = newLevelTx; // Actual new level from this successful transaction
            return { success: true, newLevel: newLevelTx, passed }; // Return success from transaction body
          });
          return result; // Return the successful transaction's result
        } catch (error) {
          attempts++;
          lastTransactionError = error;
          console.warn(`Transaction attempt ${attempts} failed:`, error);
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500 * attempts));
          }
        }
      }
      console.error(`All ${maxAttempts} transaction attempts failed:`, lastTransactionError);
      // After all retries, if still failing, return failure status with original level/passed state
      return { success: false, error: lastTransactionError, newLevel: originalLevelForFallback, passed: originalPassedForFallback };
    }
  } catch (error) {
    console.error('Outer error in updateSubcategoryProgress:', error);
    // Catch any other unexpected errors and return failure
    return { success: false, error: error, newLevel: originalLevelForFallback, passed: originalPassedForFallback };
  }
};

/**
 * Updates the askedQuestions array for a user's subcategory progress
 * 
 * @param {string} userId - User ID
 * @param {string} normalizedSubcategoryId - Already normalized subcategory ID
 * @param {Array<string>} questionIds - Question IDs to add to askedQuestions
 * @returns {Promise<void>}
 */
export const updateAskedQuestions = async (userId, normalizedSubcategoryId, questionIds) => {
  try {
    if (!userId || !normalizedSubcategoryId || !questionIds.length) return;
    
    const progressRef = doc(db, 'users', userId, 'progress', normalizedSubcategoryId);
    const progressDoc = await getDoc(progressRef);
    
    if (progressDoc.exists()) {
      // Get current asked questions
      const progressData = progressDoc.data();
      let currentAskedQuestions = progressData.askedQuestions || [];
      
      // Add new questions
      const updatedAskedQuestions = [...new Set([...currentAskedQuestions, ...questionIds])];
      
      // Trim to max length if needed
      if (updatedAskedQuestions.length > MAX_ASKED_QUESTIONS) {
        // Keep the most recent MAX_ASKED_QUESTIONS
        const trimmedQuestions = updatedAskedQuestions.slice(-MAX_ASKED_QUESTIONS);
        
        // Replace the entire array
        await updateDoc(progressRef, {
          askedQuestions: trimmedQuestions,
          lastUpdated: serverTimestamp()
        });
      } else {
        // Use arrayUnion for an atomic update that avoids duplicates
        await updateDoc(progressRef, {
          askedQuestions: arrayUnion(...questionIds),
          lastUpdated: serverTimestamp()
        });
      }
    } else {
      // Create a new document if it doesn't exist
      await setDoc(progressRef, {
        level: 1,
        mastered: false,
        askedQuestions: questionIds,
        lastUpdated: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error updating asked questions:', error);
    // Don't throw here to allow the main function to continue
  }
};

/**
 * Updates a user's progress for a specific concept
 * 
 * @param {string} userId - User ID
 * @param {string} subcategoryId - Subcategory ID that the concept belongs to
 * @param {string} conceptId - Concept ID
 * @param {boolean} mastered - Whether the concept is now mastered
 * @returns {Promise<void>}
 */
export const updateConceptProgress = async (userId, subcategoryId, conceptId, mastered) => {
  try {
    if (!userId || !subcategoryId || !conceptId) {
      console.error('Missing required parameters for updateConceptProgress');
      return;
    }

    const normalizedSubcategoryId = normalizeSubcategoryName(subcategoryId);
    const progressRef = doc(db, 'users', userId, 'progress', normalizedSubcategoryId);
    
    // Get current progress
    const progressDoc = await getDoc(progressRef);
    
    if (progressDoc.exists()) {
      // Update existing progress
      const progressData = progressDoc.data();
      const conceptMastery = progressData.conceptMastery || {};
      
      // Update the concept mastery
      conceptMastery[conceptId] = mastered;
      
      await updateDoc(progressRef, {
        conceptMastery,
        lastUpdated: serverTimestamp()
      });
    } else {
      // Create new progress document
      const conceptMastery = {};
      conceptMastery[conceptId] = mastered;
      
      await setDoc(progressRef, {
        level: 1,
        mastered: false,
        conceptMastery,
        askedQuestions: [],
        lastUpdated: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error updating concept progress:', error);
    throw error;
  }
};

/**
 * Gets the number of unmastered concepts for a user
 * Useful for showing notification badges
 * 
 * @param {string} userId - User ID
 * @returns {Promise<number>} - Count of unmastered concepts
 */
export const getUnmasteredConceptCount = async (userId) => {
  try {
    if (!userId) return 0;
    
    // This is an expensive operation, consider caching results
    
    // Get all concepts
    const conceptsRef = collection(db, 'concepts');
    const conceptsSnapshot = await getDocs(conceptsRef);
    const allConcepts = new Set();
    
    conceptsSnapshot.forEach(doc => {
      allConcepts.add(doc.id);
    });
    
    // Get all user progress docs
    const progressRef = collection(db, 'users', userId, 'progress');
    const progressSnapshot = await getDocs(progressRef);
    
    // Track mastered concepts
    const masteredConcepts = new Set();
    
    progressSnapshot.forEach(doc => {
      const progressData = doc.data();
      if (progressData.conceptMastery) {
        Object.entries(progressData.conceptMastery).forEach(([conceptId, isMastered]) => {
          if (isMastered) {
            masteredConcepts.add(conceptId);
          }
        });
      }
    });
    
    // Count unmastered concepts
    let unmasteredCount = 0;
    allConcepts.forEach(conceptId => {
      if (!masteredConcepts.has(conceptId)) {
        unmasteredCount++;
      }
    });
    
    return unmasteredCount;
  } catch (error) {
    console.error('Error getting unmastered concept count:', error);
    return 0;
  }
};
