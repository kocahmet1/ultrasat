import { db } from './config';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';

/**
 * Designates a user as an admin by email
 * @param {string} email - The email of the user to set as admin
 * @returns {Promise<boolean>} - Whether the operation was successful
 */
export const setUserAsAdmin = async (email) => {
  try {
    // First find the user with the given email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.error(`No user found with email: ${email}`);
      return false;
    }
    
    // Update the user document with admin privileges
    const userDoc = querySnapshot.docs[0];
    await setDoc(doc(db, 'users', userDoc.id), {
      ...userDoc.data(),
      isAdmin: true,
      adminSince: new Date()
    }, { merge: true });
    
    console.log(`Successfully set user ${email} as admin`);
    return true;
  } catch (error) {
    console.error('Error setting user as admin:', error);
    return false;
  }
};

/**
 * Check if a user exists with the given email, and create them with admin rights if not
 * @param {string} email - The email to check/create
 * @param {string} uid - The user ID if available
 * @returns {Promise<boolean>} - Whether the operation was successful
 */
export const ensureAdminUser = async (email, uid = null) => {
  try {
    // Check if user exists by email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    // If user exists, set as admin
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      await setDoc(doc(db, 'users', userDoc.id), {
        ...userDoc.data(),
        isAdmin: true,
        adminSince: new Date()
      }, { merge: true });
      
      console.log(`Updated existing user ${email} with admin privileges`);
      return true;
    }
    
    // If user doesn't exist and we have a UID, create new admin user
    if (uid) {
      await setDoc(doc(db, 'users', uid), {
        email,
        isAdmin: true,
        adminSince: new Date(),
        createdAt: new Date()
      });
      
      console.log(`Created new admin user for ${email}`);
      return true;
    }
    
    console.error(`Cannot create admin user without UID for email: ${email}`);
    return false;
  } catch (error) {
    console.error('Error ensuring admin user:', error);
    return false;
  }
};
