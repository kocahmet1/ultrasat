// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
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
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Development mode logging
if (window.location.hostname === 'localhost') {
  console.log('Running in development mode - Using direct API calls');
}

// Initialize Analytics if you want to use it
// const analytics = getAnalytics(app);

export { auth, db, storage, app };
