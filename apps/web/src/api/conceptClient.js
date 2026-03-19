/**
 * API client for concept-related operations
 * Handles fetching detailed explanations and associated questions
 */

import { getAuth } from 'firebase/auth';

// Base URL for API requests
const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'https://ultrasat.onrender.com';
  } else {
    return process.env.REACT_APP_API_URL || 'http://localhost:3001';
  }
};

/**
 * Get authentication token from Firebase
 */
const getAuthToken = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  return await user.getIdToken();
};

/**
 * Get detailed explanation for a concept using LLM
 * @param {Object} params - Parameters for the explanation
 * @param {string} params.conceptName - Name of the concept
 * @param {string} params.basicDefinition - Basic definition from concept bank
 * @param {string} params.subcategory - Subcategory for context
 * @returns {Promise<string>} - Detailed HTML explanation
 */
export const getConceptDetailedExplanation = async ({ conceptName, basicDefinition, subcategory }) => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${getApiUrl()}/api/concepts/detailed-explanation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        conceptName,
        basicDefinition,
        subcategory
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get detailed explanation: ${errorText}`);
    }

    const data = await response.json();
    return data.explanation;
  } catch (error) {
    console.error('Error getting detailed explanation:', error);
    throw error;
  }
};

/**
 * Get questions associated with a concept
 * @param {Object} params - Parameters for question fetching
 * @param {string} params.conceptName - Name of the concept
 * @param {string} params.subcategory - Subcategory to search in
 * @param {number} params.limit - Maximum number of questions to return
 * @returns {Promise<Array>} - Array of question objects
 */
export const getQuestionsByConceptId = async ({ conceptName, subcategory, limit = 5 }) => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${getApiUrl()}/api/concepts/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        conceptName,
        subcategory,
        limit
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get questions: ${errorText}`);
    }

    const data = await response.json();
    return data.questions || [];
  } catch (error) {
    console.error('Error getting questions by concept:', error);
    throw error;
  }
};

/**
 * Cache detailed explanation in the database
 * This function is called internally by the API after generating an explanation
 * @param {string} conceptName - Name of the concept
 * @param {string} subcategory - Subcategory for the concept
 * @param {string} explanation - The generated explanation
 * @returns {Promise<void>}
 */
export const cacheConceptExplanation = async (conceptName, subcategory, explanation) => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${getApiUrl()}/api/concepts/cache-explanation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        conceptName,
        subcategory,
        explanation
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`Failed to cache explanation: ${errorText}`);
      // Don't throw error as this is not critical
    }
  } catch (error) {
    console.warn('Error caching explanation:', error);
    // Don't throw error as this is not critical
  }
}; 