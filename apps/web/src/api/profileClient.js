import { getAuth } from 'firebase/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return window.location.origin;
  }

  return API_BASE_URL;
};

const getIdToken = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error('User not authenticated');
  }

  return user.getIdToken(true);
};

const authenticatedProfileRequest = async (path, options = {}) => {
  const token = await getIdToken();
  const headers = {
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${getApiUrl()}/api/profile${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Profile API request failed');
  }

  return response.json();
};

export const refreshUserStatsCache = async (userId) => {
  return authenticatedProfileRequest('/stats-cache/refresh', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
};

export const fetchUserRankings = async (userId = null) => {
  const path = userId ? `/rankings/${encodeURIComponent(userId)}` : '/rankings';
  return authenticatedProfileRequest(path, {
    method: 'GET',
  });
};
