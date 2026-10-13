import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const userRole = (currentUser.role || '').toLowerCase();
  const requiredRole = (allowedRole || '').toLowerCase();

  if (requiredRole && userRole !== requiredRole) {
    // Redirect to the appropriate dashboard for the user's role
    return <Navigate to={userRole === 'admin' ? '/admin' : '/student'} replace />;
  }

  return children;
};

export default ProtectedRoute;
