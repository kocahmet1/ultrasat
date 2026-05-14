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

async function requestQuestionGeneration(path, {
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

  const response = await fetch(`${apiUrl}/api/question-generation${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || 'Question generation request failed');
  }
  return data;
}

export function getQuestionGenerationPromptPreview(payload) {
  return requestQuestionGeneration('/prompt-preview', {
    method: 'POST',
    body: payload,
  });
}

export function createQuestionGenerationRun(payload) {
  return requestQuestionGeneration('/runs', {
    method: 'POST',
    body: payload,
  });
}

export function getQuestionGenerationRuns(limit = 20) {
  return requestQuestionGeneration(`/runs?limit=${encodeURIComponent(String(limit))}`);
}

export function getQuestionGenerationRun(runId) {
  return requestQuestionGeneration(`/runs/${encodeURIComponent(String(runId))}`);
}

export function updateGeneratedDraft(runId, draftId, payload) {
  return requestQuestionGeneration(
    `/runs/${encodeURIComponent(String(runId))}/drafts/${encodeURIComponent(String(draftId))}`,
    {
      method: 'PATCH',
      body: payload,
    },
  );
}

export function deleteGeneratedDraft(runId, draftId) {
  return requestQuestionGeneration(
    `/runs/${encodeURIComponent(String(runId))}/drafts/${encodeURIComponent(String(draftId))}`,
    {
      method: 'DELETE',
    },
  );
}

export function verifyGeneratedDraft(runId, draftId) {
  return requestQuestionGeneration(
    `/runs/${encodeURIComponent(String(runId))}/drafts/${encodeURIComponent(String(draftId))}/verify`,
    {
      method: 'POST',
    },
  );
}

export function publishGeneratedDraft(runId, draftId) {
  return requestQuestionGeneration(
    `/runs/${encodeURIComponent(String(runId))}/drafts/${encodeURIComponent(String(draftId))}/publish`,
    {
      method: 'POST',
    },
  );
}

export function publishGeneratedDrafts(runId, draftIds) {
  return requestQuestionGeneration(`/runs/${encodeURIComponent(String(runId))}/publish`, {
    method: 'POST',
    body: { draftIds },
  });
}
