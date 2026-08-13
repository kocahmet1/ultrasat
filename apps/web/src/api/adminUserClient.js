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

/**
 * Permanently delete a user account (Auth + all Firestore data).
 * Admin only.
 * @param {string} userId - UID of the user to delete
 * @returns {Promise<Object>} Deletion summary
 */
export const deleteUserAccount = async (userId) => {
  const token = await getIdToken();

  const response = await fetch(
    `${getApiUrl()}/api/admin/users/${encodeURIComponent(userId)}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete user');
  }

  return response.json();
};
