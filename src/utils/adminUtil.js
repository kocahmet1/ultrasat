import { ensureAdminUser, setUserAsAdmin } from '../firebase/adminSetup';
import { getAuth } from 'firebase/auth';

/**
 * Utility function to grant admin access to the currently logged in user
 * or a specific email address
 * @param {string|null} specificEmail - Optional email to grant admin access to
 */
export const grantAdminAccess = async (specificEmail = null) => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser && !specificEmail) {
      console.error('No user logged in and no email specified');
      return false;
    }
    
    const email = specificEmail || currentUser.email;
    const uid = currentUser ? currentUser.uid : null;
    
    console.log(`Attempting to grant admin access to: ${email}`);
    
    // First try to set an existing user as admin
    const setResult = await setUserAsAdmin(email);
    
    // If that fails, try to ensure the admin user exists
    if (!setResult && uid) {
      const ensureResult = await ensureAdminUser(email, uid);
      
      if (ensureResult) {
        console.log('Successfully created admin user!');
        alert(`Admin access granted to ${email}. Please refresh the page.`);
        return true;
      }
    } else if (setResult) {
      console.log('Successfully updated existing user to admin!');
      alert(`Admin access granted to ${email}. Please refresh the page.`);
      return true;
    }
    
    console.error('Failed to grant admin access');
    return false;
  } catch (error) {
    console.error('Error in grantAdminAccess:', error);
    return false;
  }
};

// Make the function accessible from the browser console
if (typeof window !== 'undefined') {
  window.grantAdminAccess = async (email = null) => {
    const { grantAdminAccess } = await import('./adminUtil');
    return grantAdminAccess(email);
  };
}
