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

  // Allow all authenticated users through (email verification is handled by reminder banner)
  return children;
}

export default PrivateRoute;
