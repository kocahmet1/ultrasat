import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp, 
  writeBatch,
  deleteDoc 
} from 'firebase/firestore';
import { 
  initializeMessaging, 
  requestNotificationPermission, 
  setupNotificationListener,
  removeTokenFromFirestore 
} from '../utils/firebaseMessaging';
import { logNotificationEvent } from '../utils/analyticsService';
import { getPracticeExamModules } from '../firebase/services';
import { updateUserStatsCache } from '../firebase/rankingServices';

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
      
      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: name
      });
      
      // Create a user document in Firestore with Free tier membership
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name,
        email,
        createdAt: new Date().toISOString(),
        examResults: [],
        membershipTier: 'free',
        membershipStartDate: new Date().toISOString(),
        membershipEndDate: null // null for free tier, date for paid tiers
      });
      
      // Create default "Deck 1" flashcard deck for the new user
      try {
        const defaultDeckRef = doc(collection(db, 'users', userCredential.user.uid, 'flashcardDecks'));
        await setDoc(defaultDeckRef, {
          name: 'Deck 1',
          description: 'Default flashcard deck',
          createdAt: serverTimestamp(),
          wordCount: 0,
          lastStudiedAt: null
        });
        console.log(`Created default "Deck 1" for new user: ${userCredential.user.uid}`);
      } catch (deckError) {
        console.error('Error creating default flashcard deck:', deckError);
        // Don't fail signup if deck creation fails - it's non-critical
      }
      
      // Send email verification via custom email service
      try {
        // Try to send via custom SendGrid service first
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        const response = await fetch(`${API_URL}/api/email/send-verification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userCredential.user.email,
            name: name
          })
        });

        if (response.ok) {
          console.log('✅ Custom verification email sent via SendGrid');
        } else {
          // Fallback to Firebase default if custom email fails
          console.warn('Custom email service failed, falling back to Firebase default');
          auth.languageCode = 'en';
          const actionCodeSettings = {
            url: `${window.location.origin}/verify-email`,
            handleCodeInApp: false
          };
          await sendEmailVerification(userCredential.user, actionCodeSettings);
          console.log('Verification email sent via Firebase default');
        }
      } catch (verifyErr) {
        console.error('Failed to send verification email:', verifyErr);
        // Try Firebase fallback one more time
        try {
          auth.languageCode = 'en';
          const actionCodeSettings = {
            url: `${window.location.origin}/verify-email`,
            handleCodeInApp: false
          };
          await sendEmailVerification(userCredential.user, actionCodeSettings);
          console.log('Verification email sent via Firebase fallback');
        } catch (fallbackErr) {
          console.error('Both email methods failed:', fallbackErr);
        }
        // Do not block signup on email sending errors
      }
      
      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  // Save or update in-progress practice exam for the current user
  async function saveOrUpdateExamProgress(progress) {
    if (!currentUser || !progress || !progress.practiceExamId) {
      console.error('[saveOrUpdateExamProgress] Missing user or practiceExamId');
      return null;
    }

    try {
      const progressRef = doc(db, `users/${currentUser.uid}/examProgress`, progress.practiceExamId);
      const existing = await getDoc(progressRef);

      const payload = {
        practiceExamId: progress.practiceExamId,
        examTitle: progress.examTitle || null,
        status: 'in-progress',
        currentModuleIndex: typeof progress.currentModuleIndex === 'number' ? progress.currentModuleIndex : 0,
        currentQuestionIndex: typeof progress.currentQuestionIndex === 'number' ? progress.currentQuestionIndex : 0,
        moduleResponses: progress.moduleResponses || {},
        modulesMeta: progress.modulesMeta || [],
        currentModuleTimeRemaining: typeof progress.currentModuleTimeRemaining === 'number' ? progress.currentModuleTimeRemaining : undefined,
        updatedAt: serverTimestamp(),
        // Preserve original startedAt if exists
        startedAt: existing.exists() ? (existing.data().startedAt || serverTimestamp()) : serverTimestamp()
      };

      await setDoc(progressRef, payload, { merge: true });

      return { id: progressRef.id, ...payload };
    } catch (err) {
      console.error('[saveOrUpdateExamProgress] Error:', err);
      throw err;
    }
  }

  // Get saved in-progress exam for a specific practice exam ID
  async function getExamProgress(practiceExamId) {
    if (!currentUser || !practiceExamId) return null;
    try {
      const progressRef = doc(db, `users/${currentUser.uid}/examProgress`, practiceExamId);
      const snap = await getDoc(progressRef);
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() };
    } catch (err) {
      console.error('[getExamProgress] Error:', err);
      return null;
    }
  }

  // List all in-progress exams for current user, newest first
  async function getInProgressExams() {
    if (!currentUser) return [];
    try {
      const progressCol = collection(db, `users/${currentUser.uid}/examProgress`);
      const qRef = query(progressCol, orderBy('updatedAt', 'desc'));
      const qs = await getDocs(qRef);
      return qs.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.error('[getInProgressExams] Error:', err);
      return [];
    }
  }

  // Clear in-progress exam (after completion or if user discards it)
  async function clearExamProgress(practiceExamId) {
    if (!currentUser || !practiceExamId) return false;
    try {
      const progressRef = doc(db, `users/${currentUser.uid}/examProgress`, practiceExamId);
      await deleteDoc(progressRef);
      return true;
    } catch (err) {
      console.error('[clearExamProgress] Error:', err);
      return false;
    }
  }

  async function login(email, password) {
    try {
      setError('');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Initialize messaging, but don't request permissions automatically
      // We'll let the user initiate this action later
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

      // Check if the user is new
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // New user, create a document in Firestore
        await setDoc(userDocRef, {
          name: user.displayName,
          email: user.email,
          createdAt: new Date().toISOString(),
          examResults: [],
          membershipTier: 'free',
          membershipStartDate: new Date().toISOString(),
          membershipEndDate: null
        });

        // Create default "Deck 1" flashcard deck
        const defaultDeckRef = doc(collection(db, 'users', user.uid, 'flashcardDecks'));
        await setDoc(defaultDeckRef, {
          name: 'Deck 1',
          description: 'Default flashcard deck',
          createdAt: serverTimestamp(),
          wordCount: 0,
          lastStudiedAt: null
        });
      }

      initializeMessaging();
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function logout() {
    try {
      // Clean up FCM token when user logs out
      if (currentUser && fcmToken) {
        await removeTokenFromFirestore(currentUser.uid, fcmToken);
        setFcmToken(null);
        setNotificationsEnabled(false);
      }
      
      await signOut(auth);
      
      // Redirect to landing page after successful logout
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  }

  // Legacy function, maintained for backward compatibility
  async function saveExamResult(moduleId, score, maxScore, responses) {
    if (!currentUser) return;
    
    try {
      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const examResults = userData.examResults || [];
        
        // Add new result
        examResults.push({
          moduleId,
          score,
          maxScore,
          responses,
          date: new Date().toISOString()
        });
        
        // Update user document
        await setDoc(userRef, {
          ...userData,
          examResults
        });
        
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error saving exam result:", err);
      return false;
    }
  }

  /**
   * Comprehensive exam result saving function
   * @param {Object} examSummary - Summary data about the exam (title, scores, etc.)
   * @param {Array} responses - Individual question responses
   * @returns {Object} - Reference to the created exam document
   */
  async function saveComprehensiveExamResult(examSummary, responses) {
    if (!currentUser) {
      console.error("Cannot save exam result: No authenticated user");
      return null;
    }
    
    try {
      console.log("Saving comprehensive exam result", { summaryFields: Object.keys(examSummary), responseCount: responses.length });
      
      // Prepare the exam document data
      const examData = {
        ...examSummary,
        userId: currentUser.uid,
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Format date-time for display purposes (in addition to Firestore timestamp)
        examDate: new Date().toISOString()
      };
      
      // Create the exam document in the user's practice exams collection
      const practiceExamsRef = collection(db, `users/${currentUser.uid}/practiceExams`);
      const examDocRef = await addDoc(practiceExamsRef, examData);
      console.log(`Created exam document with ID: ${examDocRef.id}`);
      
      // Use a batch to write all responses as a subcollection
      // Firestore has a limit of 500 operations per batch, so we might need multiple batches
      // for very long exams
      
      const MAX_BATCH_SIZE = 450; // Leave some room for potential additional operations
      
      // Process responses in chunks if needed
      for (let i = 0; i < responses.length; i += MAX_BATCH_SIZE) {
        const batch = writeBatch(db);
        const chunk = responses.slice(i, i + MAX_BATCH_SIZE);
        
        // Add each response to the subcollection
        chunk.forEach(response => {
          // Each response gets its own document in the subcollection
          const responseRef = doc(collection(examDocRef, 'responses'));
          batch.set(responseRef, {
            ...response,
            createdAt: serverTimestamp()
          });
          
          // Optional: Also add to questionAttempts collection
          // This maintains backward compatibility with existing dashboards
          // that might be reading from questionAttempts
          const attemptRef = doc(collection(db, 'questionAttempts'));
          batch.set(attemptRef, {
            ...response,
            userId: currentUser.uid,
            examId: examDocRef.id,  // Link back to this exam
            attemptedAt: serverTimestamp()
          });
        });
        
        // Commit the batch
        await batch.commit();
        console.log(`Committed batch ${i/MAX_BATCH_SIZE + 1} of responses (${chunk.length} items)`);
      }
      
      // Update user stats cache for ranking calculations
      try {
        await updateUserStatsCache(currentUser.uid);
        console.log(`[saveComprehensiveExamResult] Updated stats cache for user ${currentUser.uid}`);
      } catch (cacheError) {
        console.error('[saveComprehensiveExamResult] Error updating stats cache:', cacheError);
        // Non-critical error, don't propagate
      }
      
      return {
        id: examDocRef.id,
        ...examData
      };
    } catch (err) {
      console.error("Error saving comprehensive exam result:", err);
      throw err;
    }
  }

  /**
   * Retrieves the most recent exam result
   * @returns {Object} The most recent exam result or null
   */
  async function getLatestExamResult() {
    if (!currentUser) return null;
    
    try {
      const practiceExamsRef = collection(db, `users/${currentUser.uid}/practiceExams`);
      const q = query(practiceExamsRef, orderBy('completedAt', 'desc'), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const latestExamDoc = querySnapshot.docs[0];
      const latestExam = {
        id: latestExamDoc.id,
        ...latestExamDoc.data()
      };
      
      // Fetch responses for the latest exam
      const responsesRef = collection(latestExamDoc.ref, 'responses');
      const responsesSnapshot = await getDocs(responsesRef);
      
      const responses = [];
      responsesSnapshot.forEach(doc => {
        responses.push({
          id: doc.id,
          ...doc.data()
        });
      });
      latestExam.responses = responses;

      // If practiceExamId exists, fetch the original exam's modules and questions
      if (latestExam.practiceExamId) {
        try {
          const fullModules = await getPracticeExamModules(latestExam.practiceExamId);
          if (fullModules && fullModules.length > 0) {
            console.log('[AuthContext] Fetched full modules for latest exam:', fullModules);
            latestExam.modules = fullModules; // Replace with fully populated modules
          } else {
            console.warn(`[AuthContext] Full modules not found or empty for practiceExamId (latest exam): ${latestExam.practiceExamId}`);
          }
        } catch (error) {
          console.error(`[AuthContext] Error fetching full modules for latest exam (ID: ${latestExam.practiceExamId}):`, error);
        }
      }
      
      return latestExam;
    } catch (err) {
      console.error("Error getting latest exam result:", err);
      return null;
    }
  }

  /**
   * Retrieves a specific exam result by ID
   * @param {string} examId - The ID of the exam to retrieve
   * @param {boolean} includeResponses - Whether to include the response subcollection
   * @returns {Object} The exam result with responses (if requested)
   */
  async function getExamResultById(examId, includeResponses = true) {
    if (!currentUser || !examId) return null;
    
    try {
      const examRef = doc(db, `users/${currentUser.uid}/practiceExams`, examId);
      const examDoc = await getDoc(examRef);
      
      if (!examDoc.exists()) {
        return null;
      }
      
      const examData = {
        id: examDoc.id,
        ...examDoc.data()
      };
      
      // Optionally fetch responses
      if (includeResponses) {
        const responsesRef = collection(examRef, 'responses');
        const responsesSnapshot = await getDocs(responsesRef);
        
        const responses = [];
        responsesSnapshot.forEach(doc => {
          responses.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        examData.responses = responses;
      }

      // If practiceExamId exists, fetch the original exam's modules and questions
      if (examData.practiceExamId) {
        try {
          const fullModules = await getPracticeExamModules(examData.practiceExamId);
          if (fullModules && fullModules.length > 0) {
            console.log('[AuthContext] Fetched full modules for examId:', examData.practiceExamId, fullModules);
            examData.modules = fullModules; // Replace with fully populated modules
          } else {
            console.warn(`[AuthContext] Full modules not found or empty for practiceExamId: ${examData.practiceExamId}`);
          }
        } catch (error) {
          console.error(`[AuthContext] Error fetching full modules (ID: ${examData.practiceExamId}):`, error);
        }
      }
      
      return examData;
    } catch (err) {
      console.error(`Error getting exam result ${examId}:`, err);
      return null;
    }
  }

  async function getUserResults() {
    if (!currentUser) return [];
    
    try {
      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.examResults || [];
      }
      return [];
    } catch (err) {
      console.error("Error getting user results:", err);
      return [];
    }
  }

  // Initialize notifications for the user
  async function initializeNotifications(userId) {
    try {
      // Initialize Firebase messaging
      initializeMessaging();
      
      // Request permission and get token
      const token = await requestNotificationPermission(userId);
      
      if (token) {
        setFcmToken(token);
        setNotificationsEnabled(true);
        
        // Track that notifications were enabled
        logNotificationEvent(userId, 'notifications_enabled', {
          deviceToken: token.substring(0, 8) + '...' // Include only truncated token for privacy
        }).catch(err => console.error('Analytics error:', err));
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  // Get user's membership information
  async function getUserMembership(userParam = null) {
    const user = userParam || currentUser;
    if (!user) {
      setUserMembership(null);
      return null;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const membership = {
          tier: userData.membershipTier || 'free',
          startDate: userData.membershipStartDate,
          endDate: userData.membershipEndDate
        };
        
        // Check if paid membership has expired
        if (membership.tier !== 'free' && membership.endDate) {
          const endDate = new Date(membership.endDate);
          const now = new Date();
          
          if (now > endDate) {
            // Membership expired, downgrade to free
            await updateMembershipTier('free');
            membership.tier = 'free';
            membership.endDate = null;
          }
        }
        
        setUserMembership(membership);
        return membership;
      }
      return { tier: 'free', startDate: null, endDate: null };
    } catch (err) {
      console.error("Error getting user membership:", err);
      return { tier: 'free', startDate: null, endDate: null };
    }
  }

  // Update user's membership tier
  async function updateMembershipTier(newTier, durationMonths = null) {
    if (!currentUser) return false;
    
    try {
      const userRef = doc(db, "users", currentUser.uid);
      const updateData = {
        membershipTier: newTier,
        membershipStartDate: new Date().toISOString()
      };
      
      // Calculate end date for paid tiers
      if (newTier !== 'free' && durationMonths) {
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + durationMonths);
        updateData.membershipEndDate = endDate.toISOString();
      } else if (newTier === 'free') {
        updateData.membershipEndDate = null;
      }
      
      await setDoc(userRef, updateData, { merge: true });
      
      // Update local state
      const newMembership = {
        tier: newTier,
        startDate: updateData.membershipStartDate,
        endDate: updateData.membershipEndDate
      };
      setUserMembership(newMembership);
      
      return true;
    } catch (err) {
      console.error("Error updating membership tier:", err);
      return false;
    }
  }

  // Check if user has access to a specific feature based on membership tier
  function hasFeatureAccess(requiredTier) {
    if (!userMembership) return false;
    
    const tierHierarchy = { 'free': 0, 'plus': 1, 'max': 2 };
    const userTierLevel = tierHierarchy[userMembership.tier] || 0;
    const requiredTierLevel = tierHierarchy[requiredTier] || 0;
    
    return userTierLevel >= requiredTierLevel;
  }

  // Get membership tier display name
  function getMembershipDisplayName(tier) {
    const displayNames = {
      'free': 'Free',
      'plus': 'Plus',
      'max': 'Max'
    };
    return displayNames[tier] || 'Free';
  }

  // Enable or disable notifications
  async function toggleNotifications() {
    if (!currentUser) return false;
    
    if (notificationsEnabled) {
      // Disable notifications
      if (fcmToken) {
        await removeTokenFromFirestore(currentUser.uid, fcmToken);
        setFcmToken(null);
        
        // Track that notifications were disabled
        logNotificationEvent(currentUser.uid, 'notifications_disabled', {
          reason: 'user_toggle'
        }).catch(err => console.error('Analytics error:', err));
      }
      setNotificationsEnabled(false);
      return false;
    } else {
      // Enable notifications
      const success = await initializeNotifications(currentUser.uid);
      return success;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      // If user is logged in, get their membership info and initialize notifications
      if (user) {
        await getUserMembership(user);
        initializeNotifications(user.uid);
      } else {
        setUserMembership(null);
      }
      
      setLoading(false);
    });
    
    // Set up notification listener
    let notificationUnsubscribe = () => {};
    if (typeof window !== 'undefined') {
      notificationUnsubscribe = setupNotificationListener((payload) => {
        // Handle notification when app is in foreground
        console.log('Notification received in auth context:', payload);
        
        // Track that a notification was received in foreground
        if (currentUser) {
          logNotificationEvent(currentUser.uid, 'notification_received', {
            title: payload?.notification?.title || 'Unknown',
            notificationType: payload?.data?.type || 'general',
            skillTag: payload?.data?.skillTag || null,
            foreground: true
          }).catch(err => console.error('Analytics error:', err));
        }
        
        // You could update state or show a toast notification here
      });
    }

    return () => {
      unsubscribe();
      notificationUnsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    userMembership,
    signup,
    login,
    signInWithGoogle,
    logout,
    saveExamResult,
    saveComprehensiveExamResult,  // Add new function to context
    getLatestExamResult,          // Add new function to context
    getExamResultById,            // Add new function to context
    getUserResults,
    getUserMembership,
    updateMembershipTier,
    hasFeatureAccess,
    getMembershipDisplayName,
    error,
    notificationsEnabled,
    toggleNotifications,
    initializeNotifications,
    // In-progress practice exams
    saveOrUpdateExamProgress,
    getExamProgress,
    getInProgressExams,
    clearExamProgress
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
