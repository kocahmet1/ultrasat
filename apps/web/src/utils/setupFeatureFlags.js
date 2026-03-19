// Setup Feature Flags Script
// This script will initialize or update the feature flags in Firestore
// Run with: node src/utils/setupFeatureFlags.js

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Firebase configuration - matches your config.js
const firebaseConfig = {
  apiKey: "AIzaSyBShu68xQq8--RsaB0odS4Mj_W09iYB8rw",
  authDomain: "ultrasat-5e4c4.firebaseapp.com",
  projectId: "ultrasat-5e4c4",
  storageBucket: "ultrasat-5e4c4.firebasestorage.app",
  messagingSenderId: "452991160669",
  appId: "1:452991160669:web:3039103563d6177e1258b4",
  measurementId: "G-KEV864KGSS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Feature flags to set or update
const featureFlags = {
  smartQuizEnabled: true,
  // Add any other feature flags your application uses here
  // For example:
  // newDashboardEnabled: false,
  // debugModeEnabled: false
};

async function setupFeatureFlags() {
  try {
    // Set the feature flags document in the 'config' collection
    // Using merge: true to ensure we don't overwrite any existing flags not specified here
    await setDoc(doc(db, 'config', 'featureFlags'), featureFlags, { merge: true });
    
    console.log('Feature flags successfully set up in Firestore:');
    console.log(JSON.stringify(featureFlags, null, 2));
    console.log('\nYou can now update these flags in the Firebase console at:');
    console.log('https://console.firebase.google.com/project/ultrasat-5e4c4/firestore/data/~2Fconfig~2FfeatureFlags');
  } catch (error) {
    console.error('Error setting up feature flags:', error);
  }
}

// Run the setup function
setupFeatureFlags();
