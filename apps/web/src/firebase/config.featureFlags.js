import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './config';

/**
 * Default feature flags
 * These values will be used if no feature flags are set in Firestore
 */
export const DEFAULT_FEATURE_FLAGS = {
  useRepairEngine: false, // Existing flag
  smartQuizEnabled: true // Enable SmartQuiz by default
};

/**
 * Get feature flags from Firestore
 * @returns {Promise<Object>} Feature flags object
 */
export async function getFeatureFlags() {
  // Attempt to fetch flags from Firestore; fallback to defaults
  try {
    const ref = doc(db, 'config', 'featureFlags');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return { ...DEFAULT_FEATURE_FLAGS, ...snap.data() };
    }
  } catch (err) {
    // Guests may not have Firestore read permissions; fall back to defaults quietly
    console.warn('Feature flags unavailable, using defaults. Reason:', err?.message || err);
  }
  return DEFAULT_FEATURE_FLAGS;
}

/**
 * Initialize the repair engine feature flag
 * This should be called during app initialization
 */
export const initializeFeatureFlags = async () => {
  const flags = await getFeatureFlags();
  console.log('Feature flags initialized:', flags);
  return flags;
};

/**
 * Enable the repair engine feature
 * This can be called from an admin interface
 */
export const enableRepairEngine = async () => {
  try {
    const featureFlagRef = doc(db, 'config', 'featureFlags');
    await setDoc(featureFlagRef, { useRepairEngine: true }, { merge: true });
    console.log('Repair Engine feature enabled');
    return true;
  } catch (error) {
    console.error('Error enabling Repair Engine feature:', error);
    return false;
  }
};

/**
 * Disable the repair engine feature
 * This can be called from an admin interface
 */
export const disableRepairEngine = async () => {
  try {
    const featureFlagRef = doc(db, 'config', 'featureFlags');
    await setDoc(featureFlagRef, { useRepairEngine: false }, { merge: true });
    console.log('Repair Engine feature disabled');
    return true;
  } catch (error) {
    console.error('Error disabling Repair Engine feature:', error);
    return false;
  }
};
