/**
 * API Client Utility
 * 
 * Handles API requests to the concept analysis and drill generation endpoints
 * with proper authentication and error handling
 */

import { auth } from '../firebase/config';

// Base URL for API requests - configured for both development and production
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_API_URL || 'https://ultrasat.onrender.com/api'
  : 'http://localhost:3001/api';

/**
 * Makes an authenticated API request
 * @param {string} endpoint - API endpoint path
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - API response
 */
const authenticatedRequest = async (endpoint, options = {}) => {
  try {
    // Get current user's ID token for authentication
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const token = await currentUser.getIdToken();
    
    // Set up fetch options with authentication header
    const fetchOptions = {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    
    // Make the API request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);
    
    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status} ${response.statusText}`);
    }
    
    // Parse and return JSON response
    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

/**
 * Analyzes wrong answers from an adaptive quiz
 * @param {string} quizId - ID of the adaptive quiz
 * @param {Array} wrongQuestions - Array of questions the user got wrong
 * @returns {Promise<Object>} - Analysis results with identified concepts
 */
export const analyzeQuizWrongAnswers = async (quizId, wrongQuestions) => {
  return authenticatedRequest('/analyze-quiz', {
    method: 'POST',
    body: JSON.stringify({ quizId, wrongQuestions })
  });
};

/**
 * Generates a concept practice drill
 * @param {string} conceptId - ID of the concept to practice
 * @param {number} difficulty - Difficulty level (1-3)
 * @returns {Promise<Object>} - Generated drill with questions
 */
export const generateConceptDrill = async (conceptId, difficulty = 1) => {
  return authenticatedRequest('/generate-concept-drill', {
    method: 'POST',
    body: JSON.stringify({ conceptId, difficulty })
  });
};

/**
 * Generates a graph from question text and description using AI
 * @param {string} questionId - ID of the question to update
 * @param {string} questionText - Full question text
 * @param {string} graphDescription - Description of the graph to generate
 * @returns {Promise<Object>} - Result with graph URL and success status
 */
export const generateQuestionGraph = async (questionId, questionText, graphDescription) => {
  return authenticatedRequest('/generate-graph', {
    method: 'POST',
    body: JSON.stringify({ questionId, questionText, graphDescription })
  });
};

/**
 * Generates a graph using Plotly.js (preferred method - no Python required)
 * @param {string} questionId - ID of the question to update
 * @param {string} questionText - Full question text
 * @param {string} graphDescription - Description of the graph to generate
 * @returns {Promise<Object>} - Result with graph URL and Plotly config
 */
export const generateQuestionGraphPlotly = async (questionId, questionText, graphDescription) => {
  return authenticatedRequest('/generate-graph-plotly', {
    method: 'POST',
    body: JSON.stringify({ questionId, questionText, graphDescription })
  });
};

/**
 * Checks if Python environment is ready for graph generation
 * @returns {Promise<Object>} - Python installation status and requirements
 */
export const checkPythonEnvironment = async () => {
  return authenticatedRequest('/check-python', {
    method: 'GET'
  });
};

/**
 * Checks if Plotly.js environment is ready for graph generation (preferred)
 * @returns {Promise<Object>} - Plotly environment status and requirements
 */
export const checkPlotlyEnvironment = async () => {
  return authenticatedRequest('/check-plotly-environment', {
    method: 'GET'
  });
};

/**
 * Gets an existing concept drill
 * @param {string} conceptId - ID of the concept
 * @param {number} difficulty - Difficulty level (1-3)
 * @returns {Promise<Object>} - Existing drill with questions
 */
export const getConceptDrill = async (conceptId, difficulty = 1) => {
  return authenticatedRequest(`/concept-drill/${conceptId}?difficulty=${difficulty}`, {
    method: 'GET'
  });
};

/**
 * Checks if graph generation features are available in this environment
 * @returns {Promise<boolean>} - Whether graph generation is enabled
 */
export const isGraphGenerationAvailable = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/check-plotly-environment`);
    const data = await response.json();
    
    // If we get a 503 status, the feature is disabled
    if (response.status === 503) {
      return false;
    }
    
    // Otherwise, check if either environment is available
    return data.available || false;
  } catch (error) {
    console.error('Error checking graph generation availability:', error);
    return false;
  }
};
