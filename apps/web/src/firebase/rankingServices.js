import { fetchUserRankings, refreshUserStatsCache } from '../api/profileClient';

const EMPTY_RANKINGS = {
  questionsRanking: { percentile: 0, position: 0, total: 0 },
  accuracyRanking: { percentile: 0, position: 0, total: 0 },
};

/**
 * Update a user's cached stats when their progress changes
 * This should be called whenever a user completes a quiz or exam
 * @param {string} userId - The user ID
 */
export const updateUserStatsCache = async (userId) => {
  try {
    console.log(`Updating stats cache for user ${userId}`);

    const response = await refreshUserStatsCache(userId);
    return response.stats || { totalQuestions: 0, accuracy: 0 };
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
    const response = await fetchUserRankings(userId);
    return response.rankings || EMPTY_RANKINGS;
  } catch (error) {
    console.error('Error calculating user rankings:', error);
    return EMPTY_RANKINGS;
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
