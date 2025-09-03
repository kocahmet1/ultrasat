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

// Basic fetch with retry/backoff to mitigate transient 429/503 and network hiccups
async function fetchWithRetry(url, options = {}, {
  retries = 2,
  baseDelayMs = 400,
} = {}) {
  let attempt = 0;
  let lastErr;
  while (attempt <= retries) {
    try {
      const res = await fetch(url, options);
      if (res.status === 429 || res.status === 503) {
        // Respect Retry-After if provided
        const retryAfter = parseInt(res.headers.get('retry-after') || '0', 10);
        const backoff = retryAfter > 0 ? retryAfter * 1000 : baseDelayMs * Math.pow(2, attempt) + Math.floor(Math.random() * 150);
        await new Promise(r => setTimeout(r, backoff));
        attempt += 1;
        continue;
      }
      return res;
    } catch (err) {
      lastErr = err;
      const backoff = baseDelayMs * Math.pow(2, attempt) + Math.floor(Math.random() * 150);
      await new Promise(r => setTimeout(r, backoff));
      attempt += 1;
    }
  }
  // Final attempt without catching to throw real error
  if (lastErr) throw lastErr;
  return fetch(url, options);
}

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

  const res = await fetchWithRetry(endpoint, { method: 'GET' }, { retries: 2, baseDelayMs: 350 });
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
