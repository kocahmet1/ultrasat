import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  // Not logged in -> go to login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If email/password user and not verified -> go to verify-email
  const isPasswordProvider = (currentUser.providerData || []).some(p => p.providerId === 'password');
  if (isPasswordProvider && !currentUser.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  // Otherwise allow
  return children;
}

export default PrivateRoute;
