// Setup Feature Flags Script using Admin SDK
// This script requires a service account key to run
// You'll need to download a service account key from the Firebase console

require('dotenv').config(); // Load environment variables if you use them

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
  
  // Run the setup
  setupFeatureFlags();
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  console.log('\nTo set up Firebase Admin SDK:');
  console.log('1. Install firebase-admin: npm install firebase-admin');
  console.log('2. Download a service account key from Firebase Console > Project Settings > Service Accounts');
  console.log('3. Update this script with the path to your service account key');
  process.exit(1);
}
