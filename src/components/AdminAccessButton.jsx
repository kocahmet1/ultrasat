import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ensureAdminUser, setUserAsAdmin } from '../firebase/adminSetup';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const AdminAccessButton = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const grantAdminAccess = async () => {
    if (!currentUser) {
      setError('You must be logged in to perform this action');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      // First, check if user document exists
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // Update existing user document
        await setDoc(userDocRef, {
          ...userDoc.data(),
          isAdmin: true,
          adminSince: new Date(),
          email: currentUser.email
        }, { merge: true });
      } else {
        // Create new user document with admin rights
        await setDoc(userDocRef, {
          email: currentUser.email,
          isAdmin: true,
          adminSince: new Date(),
          createdAt: new Date()
        });
      }

      setMessage('Admin access granted! You can now access the admin dashboard.');
    } catch (error) {
      console.error('Error granting admin access:', error);
      setError('Failed to grant admin access. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const makeSpecificUserAdmin = async (email) => {
    if (!currentUser) {
      setError('You must be logged in to perform this action');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const result = await setUserAsAdmin(email);
      if (result) {
        setMessage(`Admin access granted to ${email}! Refresh and try accessing the admin dashboard.`);
      } else {
        // Try to create the user with current UID if email matches
        if (currentUser.email === email) {
          await ensureAdminUser(email, currentUser.uid);
          setMessage(`Admin access granted to ${email}! Refresh and try accessing the admin dashboard.`);
        } else {
          setError(`Could not find user with email: ${email}`);
        }
      }
    } catch (error) {
      console.error('Error granting admin access:', error);
      setError('Failed to grant admin access. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const buttonStyle = {
    backgroundColor: '#1a73e8',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginRight: '10px',
    marginBottom: '10px'
  };

  const containerStyle = {
    maxWidth: '500px',
    margin: '20px auto',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9'
  };

  const messageStyle = {
    color: 'green',
    marginTop: '10px'
  };

  const errorStyle = {
    color: 'red',
    marginTop: '10px'
  };

  return (
    <div style={containerStyle}>
      <h3>Admin Access Utility</h3>
      <p>Use these buttons to grant admin access to the current user or a specific email.</p>
      
      <div>
        <button 
          onClick={grantAdminAccess} 
          disabled={loading || !currentUser}
          style={buttonStyle}
        >
          {loading ? 'Processing...' : 'Make Me Admin'}
        </button>
        
        <button 
          onClick={() => makeSpecificUserAdmin('ahmetkoc1@gmail.com')} 
          disabled={loading || !currentUser}
          style={buttonStyle}
        >
          Make 'ahmetkoc1@gmail.com' Admin
        </button>
      </div>
      
      {message && <p style={messageStyle}>{message}</p>}
      {error && <p style={errorStyle}>{error}</p>}
      
      {!currentUser && <p style={errorStyle}>You must be logged in to use this utility.</p>}
      
      <div style={{marginTop: '15px'}}>
        <p>After granting admin access, you can access the admin dashboard at:</p>
        <a href="/admin" style={{color: '#1a73e8', textDecoration: 'underline'}}>
          /admin
        </a>
      </div>
    </div>
  );
};

export default AdminAccessButton;
