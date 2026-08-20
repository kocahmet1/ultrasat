/**
 * AI Coach — API client.
 * Single API base convention (REACT_APP_API_URL), Firebase ID-token auth.
 */

import { auth } from '../firebase/config';

const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'https://ultrasat.onrender.com';
  }
  return process.env.REACT_APP_API_URL || 'http://localhost:3001';
};

const BASE = `${getApiBaseUrl()}/api/coach`;

const getIdToken = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
};

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  try {
    headers.Authorization = `Bearer ${await getIdToken()}`;
  } catch (e) {
    // status endpoint works unauthenticated; everything else will 401 cleanly
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Coach API ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const getCoachStatus = () => request('/status');
export const fetchDebrief = (quizId) => request('/debrief', { method: 'POST', body: { quizId } });
export const sendCoachChat = (message, surface = {}) =>
  request('/chat', { method: 'POST', body: { message, surface } });
export const fetchCoachThread = (limit = 30) => request(`/thread?limit=${limit}`);
export const observeCoach = (trigger, refId) =>
  request('/observe', { method: 'POST', body: { trigger, refId } });
export const requestMicroLessonApi = ({ conceptId, subcategoryId }) =>
  request('/micro-lesson', { method: 'POST', body: { conceptId, subcategoryId } });
export const fetchNotebook = () => request('/notebook');
/** Newest proactive note (briefing / exam-note) with its blocks — UI v2. */
export const fetchLatestBriefing = () => request('/briefing');
/** Two-tier coaching: kick the background DEEP PASS if the strategy is stale.
    Fire-and-forget from surfaces — the server returns immediately. */
export const requestStrategyRefresh = (reason = 'session') =>
  request('/strategy/refresh', { method: 'POST', body: { reason } });
/** The current strategy ("the plan behind your plan") + run state. */
export const fetchStrategy = () => request('/strategy');
