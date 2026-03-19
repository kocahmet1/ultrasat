// Setup Feature Flags Script using Admin SDK
// This script requires a service account key to run
// You'll need to download a service account key from the Firebase console

require('dotenv').config();

const admin = require('firebase-admin');

// You'll need to download this from Firebase Console > Project Settings > Service Accounts
// Alternatively, you can use environment variables to store this information
try {
  // Initialize Firebase Admin
  // If you have a service account key file, use this:
  // const serviceAccount = require('../../path/to/serviceAccountKey.json');
  // admin.initializeApp({
  //   credential: admin.credential.cert(serviceAccount)
  // });

  // For this example, we'll use the application-default credentials
  // This works if you've logged in with the Firebase CLI tool
  admin.initializeApp();

  const db = admin.firestore();

  // Feature flags to set
  const featureFlags = {
    smartQuizEnabled: true,
    // Add any other feature flags your application needs
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

  setupFeatureFlags();
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
  console.log('\nMake sure you have:');
  console.log('1. Installed firebase-admin: npm install firebase-admin');
  console.log('2. Set up a service account key or logged in with Firebase CLI');
  process.exit(1);
}
