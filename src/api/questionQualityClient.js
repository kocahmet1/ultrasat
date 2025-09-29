// API client for Question Quality Checks (OpenAI-based)
// Endpoints backed by api/questionQualityRoutes.js

import { getAuth } from 'firebase/auth';

const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'https://ultrasat.onrender.com';
  } else {
    return process.env.REACT_APP_API_URL || 'http://localhost:3001';
  }
};

const getIdToken = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return user.getIdToken(true);
};

export async function runQualityForQuestion(questionId) {
  if (!questionId) throw new Error('Missing questionId');
  const apiUrl = getApiUrl();
  const idToken = await getIdToken();

  const res = await fetch(`${apiUrl}/api/question-quality/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify({ questionId })
  });
  const data = await res.json().catch(() => ({}));
  // data.results: [{ questionId, success, result|error }]
  if (Array.isArray(data.results) && data.results.length) {
    return data.results[0];
  }
  if (!res.ok) {
    // Fall back to error if no structured results
    throw new Error(data?.error || `Quality run failed for ${questionId}`);
  }
  // Ok but unexpected shape; return a generic success wrapper
  return { questionId, success: true, result: data };
}

export async function runQualityForQuestionsSequential(questionIds, onProgress) {
  const results = [];
  for (let i = 0; i < questionIds.length; i++) {
    const qid = questionIds[i];
    try {
      const item = await runQualityForQuestion(qid);
      results.push(item);
      if (onProgress) onProgress({ index: i + 1, total: questionIds.length, item, status: 'ok' });
    } catch (err) {
      const failed = { questionId: qid, success: false, error: err.message };
      results.push(failed);
      if (onProgress) onProgress({ index: i + 1, total: questionIds.length, item: failed, status: 'error' });
    }
  }
  return results;
}

export async function getLatestQualityReports(limit = 25) {
  const apiUrl = getApiUrl();
  const idToken = await getIdToken();
  const res = await fetch(`${apiUrl}/api/question-quality/latest?limit=${encodeURIComponent(String(limit))}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${idToken}` }
  });
  if (!res.ok) {
    let msg = 'Failed to fetch latest quality reports';
    try { const err = await res.json(); if (err?.error) msg = err.error; } catch {}
    throw new Error(msg);
  }
  const data = await res.json();
  return Array.isArray(data?.results) ? data.results : [];
}

export async function getQualityReport(questionId) {
  const apiUrl = getApiUrl();
  const idToken = await getIdToken();
  const res = await fetch(`${apiUrl}/api/question-quality/${encodeURIComponent(String(questionId))}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${idToken}` }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || 'Failed to fetch quality report');
  }
  return data;
}

export async function rewriteAnswerChoice(questionId, choiceIndex, apply = false) {
  const apiUrl = getApiUrl();
  const idToken = await getIdToken();
  const res = await fetch(`${apiUrl}/api/question-quality/rewrite-choice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify({ questionId, choiceIndex, apply })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || 'Failed to rewrite answer choice');
  }
  return data;
}
