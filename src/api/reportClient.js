import { getAuth } from 'firebase/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Get API base URL
 */
const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return window.location.origin;
  }
  return API_BASE_URL;
};

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
 * Report a question
 * @param {string} questionId - The ID of the question to report
 * @param {string} quizId - The ID of the quiz (optional)
 * @param {string} reason - The reason for reporting (optional)
 * @returns {Promise<Object>} Response object
 */
export const reportQuestion = async (questionId, quizId = null, reason = '') => {
  try {
    const token = await getIdToken();
    
    const response = await fetch(`${getApiUrl()}/api/reports/question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        questionId,
        quizId,
        reason
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to report question');
    }

    return await response.json();
  } catch (error) {
    console.error('Error reporting question:', error);
    throw error;
  }
};

/**
 * Get all reported questions (admin only)
 * @param {string} status - Filter by status ('all', 'pending', 'resolved', 'dismissed')
 * @param {number} limit - Maximum number of results
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Object>} Response object with reports array
 */
export const getReportedQuestions = async (status = 'all', limit = 50, offset = 0) => {
  try {
    const token = await getIdToken();
    
    const params = new URLSearchParams({
      status,
      limit: limit.toString(),
      offset: offset.toString()
    });

    const response = await fetch(`${getApiUrl()}/api/reports/questions?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch reported questions');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching reported questions:', error);
    throw error;
  }
};

/**
 * Delete a reported question (admin only)
 * @param {string} questionId - The ID of the question to delete
 * @param {string} reportId - The ID of the report (optional)
 * @returns {Promise<Object>} Response object
 */
export const deleteReportedQuestion = async (questionId, reportId = null) => {
  try {
    const token = await getIdToken();
    
    const response = await fetch(`${getApiUrl()}/api/reports/question/${questionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        reportId
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete question');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
};

/**
 * Update a reported question (admin only)
 * @param {string} questionId - The ID of the question to update
 * @param {Object} questionData - The updated question data
 * @param {string} reportId - The ID of the report (optional)
 * @returns {Promise<Object>} Response object
 */
export const updateReportedQuestion = async (questionId, questionData, reportId = null) => {
  try {
    const token = await getIdToken();
    
    const response = await fetch(`${getApiUrl()}/api/reports/question/${questionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        questionData,
        reportId
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update question');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating question:', error);
    throw error;
  }
};

/**
 * Dismiss a report without taking action (admin only)
 * @param {string} reportId - The ID of the report to dismiss
 * @param {string} reason - The reason for dismissing (optional)
 * @returns {Promise<Object>} Response object
 */
export const dismissReport = async (reportId, reason = '') => {
  try {
    const token = await getIdToken();
    
    const response = await fetch(`${getApiUrl()}/api/reports/${reportId}/dismiss`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        reason
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to dismiss report');
    }

    return await response.json();
  } catch (error) {
    console.error('Error dismissing report:', error);
    throw error;
  }
}; 