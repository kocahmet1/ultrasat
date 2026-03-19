import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function AdminRoute({ children }) {
  const { currentUser, userMembership, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="membership-gate-loading">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!userMembership) {
    return <div className="membership-gate-loading">Loading...</div>;
  }

  if (!userMembership.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;
