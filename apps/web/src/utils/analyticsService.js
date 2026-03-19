/**
 * Client-side wrapper for analytics tracking functions
 * Uses Firestore directly for tracking instead of Cloud Functions
 */
import { getFirestore, collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

// Initialize Firebase services
const db = getFirestore();

/**
 * Track an admin action (validation, edits, etc)
 * @param {string} adminId - ID of the admin user
 * @param {string} actionType - Type of action (approve, edit, reject)
 * @param {string} contentType - Type of content (lesson, quiz)
 * @param {string} contentId - ID of the content
 * @param {Object} metadata - Additional data about the action
 * @returns {Promise} - Promise from Firestore
 */
export const logAdminAction = async (adminId, actionType, contentType, contentId, metadata = {}) => {
  try {
    // Log directly to Firestore
    return await addDoc(collection(db, 'adminActions'), {
      adminId,
      actionType,
      contentType,
      contentId,
      metadata,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error logging admin action to Firestore:', error);
    throw error;
  }
};

/**
 * Track a notification event
 * @param {string} userId - ID of the user
 * @param {string} eventType - Type of event (delivered, opened, dismissed)
 * @param {Object} metadata - Additional data about the notification
 * @returns {Promise} - Promise from Firestore
 */
export const logNotificationEvent = async (userId, eventType, metadata = {}) => {
  try {
    // Log directly to Firestore
    return await addDoc(collection(db, 'notificationEvents'), {
      userId,
      eventType,
      metadata,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error logging notification event to Firestore:', error);
    throw error;
  }
};

/**
 * Track user engagement with repair engine
 * @param {string} userId - ID of the user
 * @param {string} engagementType - Type of engagement (view_lesson, complete_drill)
 * @param {string} skillTag - The skill tag engaged with
 * @param {Object} metadata - Additional data about the engagement
 * @returns {Promise} - Promise from Firestore
 */
export const logUserEngagement = async (userId, engagementType, skillTag, metadata = {}) => {
  try {
    // Log directly to Firestore
    return await addDoc(collection(db, 'userEngagement'), {
      userId,
      engagementType,
      skillTag,
      metadata,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error logging user engagement to Firestore:', error);
    throw error;
  }
};

/**
 * Fetch analytics data
 * @param {string} analyticType - Type of analytics to fetch (notifications, adminActions, userEngagement)
 * @param {number} daysBack - Number of days to look back
 * @returns {Promise<Array>} - Analytics data
 */
export const getAnalyticsData = async (analyticType, daysBack = 30) => {
  try {
    // Calculate date threshold (daysBack days ago)
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysBack);
    
    // Query Firestore directly
    let collectionName;
    switch (analyticType) {
      case 'adminActions': collectionName = 'adminActions'; break;
      case 'notifications': collectionName = 'notificationEvents'; break;
      case 'userEngagement': collectionName = 'userEngagement'; break;
      default: throw new Error(`Unknown analytic type: ${analyticType}`);
    }
    
    const q = query(
      collection(db, collectionName),
      where('timestamp', '>=', dateThreshold),
      orderBy('timestamp', 'desc'),
      limit(500)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error fetching ${analyticType} analytics:`, error);
    // Return empty array on error
    return [];
  }
};
