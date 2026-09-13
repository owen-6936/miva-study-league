import React from 'react';
import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '@/lib/stores/auth-store';

export const AdminRoute = ({ children }: { children?: React.ReactNode }) => {
  const user = useAuthStore((state) => state.user);

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children ? children : <Outlet />}</>;
};
