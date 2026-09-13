import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStore } from '@/lib/stores/auth-store';

export const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Block completely unverified users from accessing protected app areas
  if (user && user.verified === false) {
    return <Navigate to="/verify-email" replace />;
  }

  return <>{children ? children : <Outlet />}</>;
};
