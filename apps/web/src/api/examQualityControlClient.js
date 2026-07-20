import { getAuth } from 'firebase/auth';

const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'https://ultrasat.onrender.com';
  }
  return process.env.REACT_APP_API_URL || 'http://localhost:3001';
};

const getIdToken = async (forceRefresh = false) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error('User not authenticated');
  }

  return user.getIdToken(forceRefresh);
};

async function requestExamQualityControl(path, {
  method = 'GET',
  body,
} = {}) {
  const apiUrl = getApiUrl();
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const requestBody = body === undefined
    ? undefined
    : isFormData
      ? body
      : JSON.stringify(body);

  const sendRequest = async forceRefresh => {
    const idToken = await getIdToken(forceRefresh);
    const headers = {
      Authorization: `Bearer ${idToken}`,
    };

    if (body !== undefined && !isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    return fetch(`${apiUrl}/api/exam-quality-control${path}`, {
      method,
      headers,
      body: requestBody,
    });
  };

  let response = await sendRequest(false);
  if (response.status === 401) {
    response = await sendRequest(true);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data?.error
      || data?.message
      || `Exam quality control request failed (${response.status})`,
    );
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
}

export function getExamQualityControlCatalog() {
  return requestExamQualityControl('/catalog');
}

export function uploadExamQualityControlReference(file, name) {
  if (!file) {
    throw new Error('Choose a reference document to upload');
  }

  const formData = new FormData();
  formData.append('reference', file);
  formData.append('name', String(name || file.name || 'College Board reference set').trim());

  return requestExamQualityControl('/references', {
    method: 'POST',
    body: formData,
  });
}

export function createExamQualityControlRun({
  examId,
  moduleIds,
  referenceId,
}) {
  return requestExamQualityControl('/runs', {
    method: 'POST',
    body: {
      examId,
      moduleIds,
      referenceId,
    },
  });
}

export function getExamQualityControlRun(runId) {
  return requestExamQualityControl(
    `/runs/${encodeURIComponent(String(runId))}`,
  );
}

export function resumeExamQualityControlRun(runId) {
  return requestExamQualityControl(
    `/runs/${encodeURIComponent(String(runId))}/resume`,
    { method: 'POST' },
  );
}

export function publishExamQualityControlRun(runId) {
  return requestExamQualityControl(
    `/runs/${encodeURIComponent(String(runId))}/publish`,
    { method: 'POST' },
  );
}

export function repairExamQualityControlItems(runId, itemIds) {
  return requestExamQualityControl(
    `/runs/${encodeURIComponent(String(runId))}/repairs`,
    {
      method: 'POST',
      body: { itemIds },
    },
  );
}

export function rollbackExamQualityControlRepair(runId, itemId) {
  return requestExamQualityControl(
    `/runs/${encodeURIComponent(String(runId))}/repairs/${encodeURIComponent(String(itemId))}/rollback`,
    { method: 'POST' },
  );
}
