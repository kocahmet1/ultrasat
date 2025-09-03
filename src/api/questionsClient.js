/**
 * Public Questions API client
 * Fetches normalized questions for guest quizzes without requiring authentication.
 */

// Base URL for API requests - configured for both development and production
const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'https://ultrasat.onrender.com';
  } else {
    return process.env.REACT_APP_API_URL || 'http://localhost:3001';
  }
};

/**
 * Fetch public questions by subcategory
 * @param {string|number} subcategory - Kebab-case name or numeric ID
 * @param {string|null} difficulty - 'easy' | 'medium' | 'hard' | null
 * @param {number} limit - Max number of questions (default 50)
 * @returns {Promise<Array>} Normalized questions
 */
export const getPublicQuestionsBySubcategory = async (subcategory, difficulty = null, limit = 50) => {
  if (!subcategory && subcategory !== 0) throw new Error('Missing subcategory');

  const apiUrl = getApiUrl();
  const encodedSub = encodeURIComponent(String(subcategory));

  const params = new URLSearchParams();
  if (difficulty) params.append('difficulty', difficulty);
  if (limit) params.append('limit', String(limit));

  const endpoint = `${apiUrl}/api/questions/public/subcategory/${encodedSub}${params.toString() ? `?${params.toString()}` : ''}`;

  const res = await fetch(endpoint, { method: 'GET' });
  if (!res.ok) {
    let errMsg = 'Failed to fetch public questions';
    try {
      const err = await res.json();
      if (err?.error) errMsg = err.error;
    } catch (_) { /* ignore */ }
    throw new Error(errMsg);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
};
