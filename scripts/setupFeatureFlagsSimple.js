// Setup Feature Flags using Admin SDK with application default credentials
// This script uses your Firebase CLI login credentials

const admin = require('firebase-admin');

// Initialize Firebase Admin with application default credentials
admin.initializeApp();

const db = admin.firestore();

// Feature flags to set
const featureFlags = {
  smartQuizEnabled: true,
  // Add other feature flags as needed
};

async function setupFeatureFlags() {
  try {
    await db.collection('config').doc('featureFlags').set(featureFlags, { merge: true });
    console.log('Feature flags successfully set up in Firestore:');
    console.log(JSON.stringify(featureFlags, null, 2));
  } catch (error) {
    console.error('Error setting up feature flags:', error);
  } finally {
    process.exit(0);
  }
}

// Run the setup
setupFeatureFlags();
