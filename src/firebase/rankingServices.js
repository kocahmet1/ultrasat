import { db } from './config';
import { collection, getDocs, query, where, orderBy, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Update a user's cached stats when their progress changes
 * This should be called whenever a user completes a quiz or exam
 * @param {string} userId - The user ID
 */
export const updateUserStatsCache = async (userId) => {
  try {
    console.log(`Updating stats cache for user ${userId}`);
    
    // Get user's quiz questions from progress subcollection
    const progressRef = collection(db, `users/${userId}/progress`);
    const progressSnapshot = await getDocs(progressRef);
    
    // Count questions from practice exams in userProgress collection
    const userProgressRef = collection(db, 'userProgress');
    const progressQuery = query(userProgressRef, where('userId', '==', userId));
    const examProgressSnapshot = await getDocs(progressQuery);
    const examQuestionsCount = examProgressSnapshot.size;
    
    // Calculate total questions and correct answers from quizzes
    let quizQuestionsCount = 0;
    let correctTotal = 0;
    
    progressSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.totalQuestions) {
        quizQuestionsCount += data.totalQuestions;
      }
      if (data.correctTotal) {
        correctTotal += data.correctTotal;
      }
    });
    
    // Total questions is the sum of quiz questions and exam questions
    const totalQuestions = quizQuestionsCount + examQuestionsCount;
    
    // Accuracy is based primarily on quiz questions since we track that more precisely
    const accuracy = quizQuestionsCount > 0 ? (correctTotal / quizQuestionsCount) * 100 : 0;
    
    // Cache the computed stats
    const userStatsRef = doc(db, 'userStatsCache', userId);
    await setDoc(userStatsRef, {
      userId,
      totalQuestions,
      accuracy: Math.round(accuracy),
      lastUpdated: serverTimestamp()
    }, { merge: true });
    
    console.log(`Updated stats cache for user ${userId}: ${totalQuestions} questions, ${accuracy.toFixed(1)}% accuracy`);
    
    return { totalQuestions, accuracy: Math.round(accuracy) };
  } catch (error) {
    console.error(`Error updating stats cache for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Get or compute user rankings efficiently
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - Object containing the user's ranking information
 */
export const getUserRankings = async (userId) => {
  try {
    // First, ensure this user's stats are up to date
    await updateUserStatsCache(userId);
    
    // Get all cached user stats - this is a single query instead of N queries
    const userStatsCacheSnapshot = await getDocs(collection(db, 'userStatsCache'));
    const allUsersStats = userStatsCacheSnapshot.docs.map(doc => doc.data());
    
    if (allUsersStats.length <= 1) {
      return {
        questionsRanking: { percentile: 0, position: 1, total: allUsersStats.length },
        accuracyRanking: { percentile: 0, position: 1, total: allUsersStats.length }
      };
    }
    
    // Filter out users with no progress
    const validUsersStats = allUsersStats.filter(user => user.totalQuestions > 0);
    
    // Sort users by questions solved (descending)
    const questionsSorted = [...validUsersStats].sort((a, b) => b.totalQuestions - a.totalQuestions);
    
    // Sort users by accuracy (descending)
    const accuracySorted = [...validUsersStats].sort((a, b) => b.accuracy - a.accuracy);
    
    // Find current user's position in both rankings
    const questionsPosition = questionsSorted.findIndex(user => user.userId === userId) + 1;
    const accuracyPosition = accuracySorted.findIndex(user => user.userId === userId) + 1;
    
    // Calculate percentiles (lower percentile is better, e.g. top 5%)
    const validUsers = validUsersStats.length;
    const questionsPercentile = Math.round((questionsPosition / validUsers) * 100);
    const accuracyPercentile = Math.round((accuracyPosition / validUsers) * 100);
    
    console.log(`Rankings for user ${userId}: Questions ${questionsPosition}/${validUsers} (${questionsPercentile}%), Accuracy ${accuracyPosition}/${validUsers} (${accuracyPercentile}%)`);
    
    return {
      questionsRanking: {
        percentile: questionsPercentile,
        position: questionsPosition,
        total: validUsers
      },
      accuracyRanking: {
        percentile: accuracyPercentile,
        position: accuracyPosition,
        total: validUsers
      }
    };
    
  } catch (error) {
    console.error('Error calculating user rankings:', error);
    return {
      questionsRanking: { percentile: 0, position: 0, total: 0 },
      accuracyRanking: { percentile: 0, position: 0, total: 0 }
    };
  }
};

/**
 * Legacy function - kept for backward compatibility but now uses cached stats
 * Calculate user rankings based on questions solved and accuracy
 * @param {string} userId - The user ID  
 * @returns {Promise<Object>} - Object containing the user's ranking information
 */
export const getUserRankingsLegacy = async (userId) => {
  console.warn('getUserRankingsLegacy is deprecated. Use getUserRankings instead for better performance.');
  return getUserRankings(userId);
};
