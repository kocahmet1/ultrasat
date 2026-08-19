/**
 * Practice-exam result management — API client.
 *
 * Deleting a result, or excluding it from coaching, has to happen server-side:
 * the records that feed the AI coach (activityEvents, questionAttempts, Tier-2
 * state, coach notes) are immutable or invisible to clients by design.
 * See apps/api/examResultRoutes.js.
 *
 * Same API-base + Firebase ID-token convention as api/coachClient.js.
 */

import { auth } from '../firebase/config';

const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'https://ultrasat.onrender.com';
  }
  return process.env.REACT_APP_API_URL || 'http://localhost:3001';
};

const BASE = `${getApiBaseUrl()}/api/exam-results`;

async function request(path, { method = 'GET', body } = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await user.getIdToken()}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Exam results API ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

/**
 * Permanently remove a result and everything derived from it, then rebuild the
 * coach's derived state from the remaining activity. Not reversible.
 */
export const deleteExamResult = (resultId) => request(`/${resultId}`, { method: 'DELETE' });

/**
 * Keep the result in the student's history but hide it from the AI coach
 * (or put it back). Reversible — the underlying events are flagged, not deleted.
 */
export const setExamResultCoachExclusion = (resultId, excluded) =>
  request(`/${resultId}/coach-exclusion`, { method: 'POST', body: { excluded: !!excluded } });
