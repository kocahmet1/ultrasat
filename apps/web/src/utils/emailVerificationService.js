import { sendEmailVerification } from 'firebase/auth';

const DEFAULT_API_URL = 'http://localhost:3001';

const getVerificationRedirectUrl = () => {
  if (typeof window === 'undefined') {
    return '/verify-email';
  }

  return `${window.location.origin}/verify-email`;
};

const getVerificationActionCodeSettings = () => ({
  url: getVerificationRedirectUrl(),
  handleCodeInApp: false,
});

export const sendFirebaseVerificationEmail = async (user, authInstance) => {
  if (authInstance) {
    authInstance.languageCode = 'en';
  }

  await sendEmailVerification(user, getVerificationActionCodeSettings());

  return { method: 'firebase' };
};

export const sendVerificationEmailWithFallback = async ({
  user,
  name,
  authInstance,
  fetchImpl = typeof window !== 'undefined' ? window.fetch.bind(window) : undefined,
}) => {
  if (!user) {
    throw new Error('User is required to send a verification email.');
  }

  if (typeof fetchImpl === 'function') {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || DEFAULT_API_URL;
      const idToken = await user.getIdToken();
      const response = await fetchImpl(`${apiUrl}/api/email/send-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          email: user.email,
          name: name || user.displayName || 'Student',
        }),
      });

      if (response.ok) {
        console.log('Verification email sent via SendGrid');
        return { method: 'custom' };
      }

      console.warn(
        `Custom email service failed with status ${response.status}. Falling back to Firebase default.`,
      );
    } catch (error) {
      console.error('Custom verification email request failed:', error);
    }
  }

  return sendFirebaseVerificationEmail(user, authInstance);
};
