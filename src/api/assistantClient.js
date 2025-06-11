/**
 * API client for the SmartQuiz AI Assistant
 * This module provides functions to interact with the SmartQuiz AI Assistant API
 */

import { getAuth } from 'firebase/auth';

// Module-level cache for vocabulary definitions
const vocabularyCache = {};

/**
 * Get the current user's ID token for authentication
 * @returns {Promise<string>} The ID token
 */
const getIdToken = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user.getIdToken(true);
};

/**
 * Ask the assistant a question about the current quiz question
 * @param {Object} params - The request parameters
 * @param {string} params.quizId - The quiz ID
 * @param {string} params.questionId - The question ID
 * @param {Object} params.question - The question object (text, options, correctAnswer)
 * @param {Array} params.history - The chat history array
 * @param {boolean} params.tipRequested - Whether a tip was requested
 * @param {boolean} params.summariseRequested - Whether a text summary was requested
 * @param {boolean} params.priming - Whether priming is requested
 * @returns {Promise<Object>} The assistant's response
 */
export async function askAssistant({ quizId, questionId, question, questionDetails, history = [], tipRequested = false, summariseRequested = false, priming = false }) {
  try {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const endpoint = `${apiUrl}/api/assistant`;
    
    const idToken = await getIdToken();
    
    console.log('Sending request to assistant API with (assistantClient.js):', {
      quizId,
      questionId,
      historyLength: history.length,
      tipRequested,
      summariseRequested,
      priming // Log the priming flag
    });
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        quizId,
        questionId,
        question,
        questionDetails,
        history,
        tipRequested,
        summariseRequested,
        priming // Add priming flag to request body
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get assistant response');
    }
    
    const responseData = await response.json();
    console.log('Got response from assistant API:', responseData);
    
    // Ensure we have a proper message format for the UI
    return {
      message: responseData.message || 'Sorry, I couldn\'t generate a response',
      usage: responseData.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
    };
  } catch (error) {
    console.error('Assistant client error:', error);
    throw error;
  }
}

/**
 * Get the chat history for a specific question
 * @param {string} quizId - The quiz ID
 * @param {string} questionId - The question ID
 * @returns {Promise<Array>} The chat history
 */
export async function getChatHistory(quizId, questionId) {
  try {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const endpoint = `${apiUrl}/api/assistant/history/${quizId}/${questionId}`;
    
    const idToken = await getIdToken();
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get chat history');
    }
    
    const data = await response.json();
    return data.history || [];
  } catch (error) {
    console.error('Error getting chat history:', error);
    return []; // Return empty array on error for graceful fallback
  }
}

/**
 * Get challenging vocabulary words and their definitions for a question
 * @param {string} quizId - The quiz ID
 * @param {string} questionId - The question ID
 * @param {Object} questionContent - The question text and options
 * @returns {Promise<Array>} Array of { word, definition } objects
 */
export async function getVocabularyDefinitions(quizId, questionId, questionContent) {
  try {
    const startTime = performance.now();
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const endpoint = `${apiUrl}/api/assistant/vocabulary`;
    
    // Generate a unique cache key
    const cacheKey = `${quizId}_${questionId}`;
    
    // Check if data is in client-side cache
    if (vocabularyCache[cacheKey]) {
      console.log('📋 [CLIENT-CACHE] Returning cached vocabulary for:', cacheKey);
      return vocabularyCache[cacheKey];
    }
    
    console.log(`🔍 [VOCABULARY] Requesting vocabulary for question: ${questionId}`);
    const tokenStartTime = performance.now();
    const idToken = await getIdToken();
    console.log(`⏱️ [PERF] Auth token retrieval took ${(performance.now() - tokenStartTime).toFixed(2)}ms`);
    
    const fetchStartTime = performance.now();
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        quizId,
        questionId,
        questionContent
      })
    });
    console.log(`⏱️ [PERF] API fetch took ${(performance.now() - fetchStartTime).toFixed(2)}ms`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get vocabulary definitions');
    }
    
    const jsonStartTime = performance.now();
    const data = await response.json();
    console.log(`⏱️ [PERF] JSON parsing took ${(performance.now() - jsonStartTime).toFixed(2)}ms`);
    
    // Check if the response indicates it came from cache
    const sourceType = data.fromCache ? 'SERVER-CACHE' : 'LLM-API';
    console.log(`🔤 [${sourceType}] Received ${data.vocabularyWords?.length || 0} vocabulary definitions`);
    
    // Store in client-side cache before returning
    const definitions = data.vocabularyWords || [];
    vocabularyCache[cacheKey] = definitions;
    
    const totalTime = performance.now() - startTime;
    console.log(`⏱️ [PERF] Total vocabulary retrieval took ${totalTime.toFixed(2)}ms`);
    
    return definitions;
  } catch (error) {
    console.error('❌ [ERROR] Error getting vocabulary definitions:', error);
    return []; // Return empty array on error for graceful fallback
  }
}
