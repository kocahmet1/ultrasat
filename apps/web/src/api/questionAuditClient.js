import { getAuth } from 'firebase/auth';

const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'https://ultrasat.onrender.com';
  }
  return process.env.REACT_APP_API_URL || 'http://localhost:3001';
};

const getIdToken = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return user.getIdToken(true);
};

async function requestQuestionAudit(path, {
  method = 'GET',
  body,
} = {}) {
  const apiUrl = getApiUrl();
  const idToken = await getIdToken();
  const headers = {
    Authorization: `Bearer ${idToken}`,
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${apiUrl}/api/question-audit${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.error || 'Question audit request failed');
    error.blockers = Array.isArray(data?.blockers) ? data.blockers : [];
    throw error;
  }
  return data;
}

export function createQuestionAuditRun(payload) {
  return requestQuestionAudit('/runs', {
    method: 'POST',
    body: payload,
  });
}

export function getQuestionAuditCandidates({
  subcategory,
  difficulty,
  limit = 25,
}) {
  const params = new URLSearchParams();
  params.set('subcategory', String(subcategory));
  params.set('difficulty', String(difficulty));
  params.set('limit', String(limit));
  return requestQuestionAudit(`/questions?${params.toString()}`);
}

export function deleteQuestionAuditQuestions(questionIds, options = {}) {
  return requestQuestionAudit('/questions', {
    method: 'DELETE',
    body: { questionIds, ...options },
  });
}

export function getQuestionAuditRuns(limit = 20) {
  return requestQuestionAudit(`/runs?limit=${encodeURIComponent(String(limit))}`);
}

export function getQuestionAuditRun(runId) {
  return requestQuestionAudit(`/runs/${encodeURIComponent(String(runId))}`);
}

export function updateQuestionAuditDraft(runId, draftId, payload) {
  return requestQuestionAudit(
    `/runs/${encodeURIComponent(String(runId))}/drafts/${encodeURIComponent(String(draftId))}`,
    {
      method: 'PATCH',
      body: payload,
    },
  );
}

export function deleteQuestionAuditDraft(runId, draftId) {
  return requestQuestionAudit(
    `/runs/${encodeURIComponent(String(runId))}/drafts/${encodeURIComponent(String(draftId))}`,
    {
      method: 'DELETE',
    },
  );
}

export function verifyQuestionAuditDraft(runId, draftId) {
  return requestQuestionAudit(
    `/runs/${encodeURIComponent(String(runId))}/drafts/${encodeURIComponent(String(draftId))}/verify`,
    {
      method: 'POST',
    },
  );
}

export function reviseQuestionAuditDraft(runId, draftId, customInstruction = '') {
  return requestQuestionAudit(
    `/runs/${encodeURIComponent(String(runId))}/drafts/${encodeURIComponent(String(draftId))}/revise`,
    {
      method: 'POST',
      body: { customInstruction },
    },
  );
}

export function publishQuestionAuditDraft(runId, draftId, options = {}) {
  return requestQuestionAudit(
    `/runs/${encodeURIComponent(String(runId))}/drafts/${encodeURIComponent(String(draftId))}/publish`,
    {
      method: 'POST',
      body: options,
    },
  );
}

export function publishQuestionAuditDrafts(runId, draftIds, options = {}) {
  return requestQuestionAudit(`/runs/${encodeURIComponent(String(runId))}/publish`, {
    method: 'POST',
    body: { draftIds, ...options },
  });
}
