import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '../firebase/config';
import {
  initializeMessaging,
  requestNotificationPermission,
  setupNotificationListener,
  removeTokenFromFirestore,
} from '../utils/firebaseMessaging';
import { logNotificationEvent } from '../utils/analyticsService';
import {
  DEFAULT_USER_MEMBERSHIP,
  ensureUserAccount,
  getUserMembershipProfile,
  initializeUserAccount,
} from '../firebase/userAccountServices';
import {
  clearExamProgress as clearUserExamProgress,
  getExamProgress as getSavedExamProgress,
  getExamResultById as getStoredExamResultById,
  getInProgressExams as listInProgressExams,
  getLatestExamResult as getMostRecentExamResult,
  getUserResults as getStoredUserResults,
  saveComprehensiveExamResult as storeComprehensiveExamResult,
  saveExamResult as storeLegacyExamResult,
  saveOrUpdateExamProgress as saveUserExamProgress,
} from '../firebase/userExamServices';
import {
  FEATURE_ACCESS,
  hasAccess as hasMembershipTierAccess,
  hasFeatureAccess as hasFeatureTierAccess,
} from '../utils/membershipUtils';
import { sendVerificationEmailWithFallback } from '../utils/emailVerificationService';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userMembership, setUserMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fcmToken, setFcmToken] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  async function signup(email, password, name) {
    try {
      setError('');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(userCredential.user, {
        displayName: name,
      });

      await initializeUserAccount(userCredential.user.uid, {
        name,
        email,
      });

      try {
        await sendVerificationEmailWithFallback({
          user: userCredential.user,
          name,
          authInstance: auth,
        });
      } catch (verifyErr) {
        console.error('Failed to send verification email:', verifyErr);
      }

      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function saveOrUpdateExamProgress(progress) {
    return saveUserExamProgress(currentUser?.uid, progress);
  }

  async function getExamProgress(practiceExamId) {
    return getSavedExamProgress(currentUser?.uid, practiceExamId);
  }

  async function getInProgressExams() {
    return listInProgressExams(currentUser?.uid);
  }

  async function clearExamProgress(practiceExamId) {
    return clearUserExamProgress(currentUser?.uid, practiceExamId);
  }

  async function login(email, password) {
    try {
      setError('');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      initializeMessaging();

      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function signInWithGoogle() {
    try {
      setError('');
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      await ensureUserAccount({
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
      });

      initializeMessaging();
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function logout() {
    try {
      if (currentUser && fcmToken) {
        await removeTokenFromFirestore(currentUser.uid, fcmToken);
        setFcmToken(null);
        setNotificationsEnabled(false);
      }

      await signOut(auth);
      window.location.href = '/';
    } catch (logoutError) {
      console.error('Error during logout:', logoutError);
      throw logoutError;
    }
  }

  async function saveExamResult(moduleId, score, maxScore, responses) {
    return storeLegacyExamResult(currentUser?.uid, moduleId, score, maxScore, responses);
  }

  async function saveComprehensiveExamResult(examSummary, responses) {
    return storeComprehensiveExamResult(currentUser?.uid, examSummary, responses);
  }

  async function getLatestExamResult() {
    return getMostRecentExamResult(currentUser?.uid);
  }

  async function getExamResultById(examId, includeResponses = true) {
    return getStoredExamResultById(currentUser?.uid, examId, includeResponses);
  }

  async function getUserResults() {
    return getStoredUserResults(currentUser?.uid);
  }

  const initializeNotifications = useCallback(async (userId) => {
    try {
      initializeMessaging();

      const token = await requestNotificationPermission(userId);

      if (token) {
        setFcmToken(token);
        setNotificationsEnabled(true);

        logNotificationEvent(userId, 'notifications_enabled', {
          deviceToken: token.substring(0, 8) + '...',
        }).catch((analyticsError) => console.error('Analytics error:', analyticsError));

        return true;
      }

      return false;
    } catch (notificationError) {
      console.error('Error initializing notifications:', notificationError);
      return false;
    }
  }, []);

  const getUserMembership = useCallback(async (userParam = null) => {
    const user = userParam || auth.currentUser;
    if (!user) {
      setUserMembership(null);
      return null;
    }

    try {
      const membership = await getUserMembershipProfile(user.uid);
      setUserMembership(membership);
      return membership;
    } catch (membershipError) {
      console.error('Error getting user membership:', membershipError);
      const fallbackMembership = { ...DEFAULT_USER_MEMBERSHIP };
      setUserMembership(fallbackMembership);
      return fallbackMembership;
    }
  }, []);

  function hasFeatureAccess(requiredTierOrFeature) {
    if (!userMembership) {
      return false;
    }

    if (FEATURE_ACCESS[requiredTierOrFeature]) {
      return hasFeatureTierAccess(userMembership.tier, requiredTierOrFeature);
    }

    return hasMembershipTierAccess(userMembership.tier, requiredTierOrFeature);
  }

  function getMembershipDisplayName(tier) {
    const displayNames = {
      free: 'Free',
      plus: 'Plus',
      max: 'Max',
    };

    return displayNames[tier] || 'Free';
  }

  async function toggleNotifications() {
    if (!currentUser) {
      return false;
    }

    if (notificationsEnabled) {
      if (fcmToken) {
        await removeTokenFromFirestore(currentUser.uid, fcmToken);
        setFcmToken(null);

        logNotificationEvent(currentUser.uid, 'notifications_disabled', {
          reason: 'user_toggle',
        }).catch((analyticsError) => console.error('Analytics error:', analyticsError));
      }

      setNotificationsEnabled(false);
      return false;
    }

    return initializeNotifications(currentUser.uid);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        await getUserMembership(user);
        initializeNotifications(user.uid);
      } else {
        setUserMembership(null);
      }

      setLoading(false);
    });

    let notificationUnsubscribe = () => {};
    if (typeof window !== 'undefined') {
      notificationUnsubscribe = setupNotificationListener((payload) => {
        console.log('Notification received in auth context:', payload);

        const activeUser = auth.currentUser;
        if (activeUser) {
          logNotificationEvent(activeUser.uid, 'notification_received', {
            title: payload?.notification?.title || 'Unknown',
            notificationType: payload?.data?.type || 'general',
            skillTag: payload?.data?.skillTag || null,
            foreground: true,
          }).catch((analyticsError) => console.error('Analytics error:', analyticsError));
        }
      });
    }

    return () => {
      unsubscribe();
      notificationUnsubscribe();
    };
  }, [getUserMembership, initializeNotifications]);

  const value = {
    currentUser,
    userMembership,
    signup,
    login,
    signInWithGoogle,
    logout,
    saveExamResult,
    saveComprehensiveExamResult,
    getLatestExamResult,
    getExamResultById,
    getUserResults,
    getUserMembership,
    hasFeatureAccess,
    getMembershipDisplayName,
    loading,
    error,
    notificationsEnabled,
    toggleNotifications,
    initializeNotifications,
    saveOrUpdateExamProgress,
    getExamProgress,
    getInProgressExams,
    clearExamProgress,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
