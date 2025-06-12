/**
 * Helper client for fetching vocabulary definitions and concept explanations.
 * This provides a unified interface to get the appropriate helper data for a question.
 */
import { getAuth } from 'firebase/auth';

// Base URL for API requests - configured for both development and production
const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'https://ultrasat.onrender.com';
  } else {
    return process.env.REACT_APP_API_URL || 'http://localhost:3001';
  }
};

// Get the current user's auth token
const getAuthToken = async () => {
  const auth = getAuth();
  if (auth.currentUser) {
    return auth.currentUser.getIdToken();
  }
  return null;
};

// Module-level cache for helper data to avoid redundant API calls during a session
const helperCache = {};

// Cache expiration time (30 minutes)
const CACHE_EXPIRATION_MS = 30 * 60 * 1000;

/**
 * Fetch helper data (vocabulary or concept) for a specific question
 * @param {string} quizId - The quiz ID
 * @param {string} questionId - The question ID
 * @param {Object} questionContent - The question content to analyze
 * @param {string} helperType - The type of helper to fetch ('vocabulary' or 'concept')
 * @param {string} subcategory - The subcategory of the question (used for concept helper)
 * @returns {Promise<Array>} - Array of helper items { term, definition }
 */
export const getHelperData = async (quizId, questionId, questionContent, helperType, subcategory) => {
  try {
    // Create cache key using questionId and helperType (not quizId) for better reusability
    const cacheKey = `helper_${questionId}_${helperType}`;
    
    // Log detailed information
    console.log('===== HELPER API CALL DETAILS =====');
    console.log(`QuizID: ${quizId}`);
    console.log(`QuestionID: ${questionId}`);
    console.log(`Helper Type: ${helperType} (this should be 'vocabulary' or 'concept')`);
    console.log(`Subcategory: ${subcategory}`);
    console.log(`Question Content:`, questionContent);
    console.log('==================================');
    
    // Check cache first with expiration check
    if (helperCache[cacheKey]) {
      const cached = helperCache[cacheKey];
      const now = Date.now();
      
      // Check if cache is still valid
      if (cached.timestamp && (now - cached.timestamp) < CACHE_EXPIRATION_MS) {
        console.log(`Fetching ${helperType} data from CLIENT cache for question ${questionId} (cached ${Math.round((now - cached.timestamp) / 1000)}s ago)`);
        return cached.data;
      } else {
        // Cache expired, remove it
        console.log(`Client cache expired for ${helperType} data for question ${questionId}, fetching fresh data`);
        delete helperCache[cacheKey];
      }
    }
    
    console.log(`Making API call for ${helperType} data for question ${questionId}`);
    
    const token = await getAuthToken();
    const endpoint = `${getApiUrl()}/api/assistant/helper`;
    
    // Log request information
    console.log('Sending helper request to:', endpoint);
    console.log('Request payload:', {
      quizId,
      questionId,
      helperType,
      subcategory
    });
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        quizId,
        questionId,
        questionContent,
        helperType,  // This is the critical field - should be 'vocabulary' or 'concept'
        subcategory
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get helper data: ${errorText}`);
    }

    const data = await response.json();
    
    // For backwards compatibility with existing code, maintain vocabularyWords field but
    // normalize return format to use items consistently
    const helperItems = data.items || data.vocabularyWords || [];
    
    // Cache the result with timestamp for expiration
    helperCache[cacheKey] = {
      data: helperItems,
      timestamp: Date.now()
    };
    
    console.log(`Cached ${helperItems.length} ${helperType} items for question ${questionId}`);
    
    return helperItems;
  } catch (error) {
    console.error('Error fetching helper data:', error);
    return []; // Return empty array on error
  }
};

/**
 * Legacy function for backward compatibility
 * @deprecated Use getHelperData() instead
 */
export const getVocabularyDefinitions = async (quizId, questionId, questionContent) => {
  return getHelperData(quizId, questionId, questionContent, 'vocabulary');
};

/**
 * Save a helper item (vocabulary word or concept) to the user's bank
 * @param {string} term - The term (word or concept name) to save
 * @param {string} definition - The definition or explanation
 * @param {string} type - The type of item ('word' or 'concept')
 * @param {string} source - Source of the item (e.g., 'quiz', 'search')
 * @param {Object} metadata - Additional metadata to store
 * @returns {Promise<string>} - ID of the saved item
 */
export const saveBankItem = async (term, definition, type = 'word', source = 'quiz', metadata = {}) => {
  try {
    console.log(`[HelperClient] saveBankItem called with:`, { term, definition, type, source, metadata });
    
    // Get auth token
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    console.log(`[HelperClient] Making API request to save bank item...`);

    // Make API request to save the item
    const response = await fetch(`${getApiUrl()}/api/bank/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        term,
        definition,
        type, // 'word' or 'concept'
        source,
        metadata
      })
    });

    console.log(`[HelperClient] API response status:`, response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[HelperClient] API error:`, errorText);
      throw new Error(`Failed to save to bank: ${errorText}`);
    }

    const data = await response.json();
    console.log(`[HelperClient] Successfully saved item, response:`, data);
    return data.id; // Return ID of the saved item
  } catch (error) {
    console.error(`Error saving ${type} to bank:`, error);
    throw error; // Rethrow for handling by the caller
  }
};
