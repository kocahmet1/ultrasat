import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, getDoc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { app, db } from '../firebase/config';

// Handles Firebase Cloud Messaging setup and token management
// This allows the app to receive push notifications

let messaging = null;

/**
 * Initialize Firebase messaging if supported by the browser
 * @returns {Object|null} Firebase messaging instance or null if not supported
 */
export const initializeMessaging = () => {
  try {
    if (!messaging && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      messaging = getMessaging(app);
      return messaging;
    }
    return messaging;
  } catch (error) {
    console.error('Error initializing Firebase messaging:', error);
    return null;
  }
};

/**
 * Request permission and get FCM token
 * @param {string} userId - User ID to associate with the token
 * @returns {Promise<string|null>} FCM token or null if failed
 */
export const requestNotificationPermission = async (userId) => {
  try {
    // Check if we've already been denied recently to prevent repeated requests
    const lastDenied = localStorage.getItem('notification_permission_denied_at');
    if (lastDenied) {
      const lastDeniedTime = parseInt(lastDenied, 10);
      // Don't ask again for 7 days if previously denied
      if (Date.now() - lastDeniedTime < 7 * 24 * 60 * 60 * 1000) {
        console.log('Notification permission was recently denied, not asking again');
        return null;
      }
    }

    if (!messaging) {
      messaging = initializeMessaging();
    }
    
    if (!messaging) {
      console.log('Firebase messaging not supported in this browser');
      return null;
    }
    
    console.log('Requesting notification permission...');
    
    // Request permission first
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      // Store the time when permission was denied
      localStorage.setItem('notification_permission_denied_at', Date.now().toString());
      return null;
    }
    
    // Get FCM token
    const currentToken = await getToken(messaging, {
      vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY // Your VAPID key for web push
    });
    
    if (currentToken) {
      console.log('FCM token obtained');
      
      // Save token to user's document in Firestore
      await saveTokenToFirestore(userId, currentToken);
      
      return currentToken;
    } else {
      console.log('No token received');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

/**
 * Save FCM token to user's Firestore document
 * @param {string} userId - User ID
 * @param {string} token - FCM token to save
 */
export const saveTokenToFirestore = async (userId, token) => {
  if (!userId || !token) return;
  
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      // Add token to user's tokens array if it doesn't exist already
      const userData = userDoc.data();
      const tokens = userData.fcmTokens || [];
      
      if (!tokens.includes(token)) {
        await setDoc(userRef, {
          fcmTokens: arrayUnion(token)
        }, { merge: true });
        console.log('Token saved to Firestore');
      }
    } else {
      // Create user document with token
      await setDoc(userRef, {
        fcmTokens: [token]
      }, { merge: true });
      console.log('Created new user document with token');
    }
  } catch (error) {
    console.error('Error saving token to Firestore:', error);
  }
};

/**
 * Remove FCM token from user's Firestore document
 * @param {string} userId - User ID
 * @param {string} token - FCM token to remove
 */
export const removeTokenFromFirestore = async (userId, token) => {
  if (!userId || !token) return;
  
  try {
    const userRef = doc(db, 'users', userId);
    
    await setDoc(userRef, {
      fcmTokens: arrayRemove(token)
    }, { merge: true });
    
    console.log('Token removed from Firestore');
  } catch (error) {
    console.error('Error removing token from Firestore:', error);
  }
};

/**
 * Setup foreground notification handling
 * @param {Function} callback - Function to call when a notification is received
 * @returns {Function} Unsubscribe function
 */
export const setupNotificationListener = (callback) => {
  if (!messaging) {
    messaging = initializeMessaging();
  }
  
  if (!messaging) {
    console.log('Firebase messaging not supported');
    return () => {};
  }
  
  return onMessage(messaging, (payload) => {
    console.log('Notification received in foreground:', payload);
    
    // Create a notification if the app is in the foreground
    if (payload.notification) {
      const { title, body } = payload.notification;
      
      // Show using system notification if permission granted
      if (Notification.permission === 'granted') {
        const notificationOptions = {
          body,
          icon: '/logo192.png'
        };
        
        const notification = new Notification(title, notificationOptions);
        notification.onclick = () => {
          // Handle notification click
          window.focus();
          notification.close();
          
          // Call the callback if provided
          if (callback && typeof callback === 'function') {
            callback(payload);
          }
        };
      }
    }
    
    // Call the callback if provided
    if (callback && typeof callback === 'function') {
      callback(payload);
    }
  });
};
