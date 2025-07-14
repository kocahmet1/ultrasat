import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  const location = useLocation();
  
  return currentUser ? children : <Navigate to="/login" state={{ from: location.pathname }} replace />;
}

export default PrivateRoute;
