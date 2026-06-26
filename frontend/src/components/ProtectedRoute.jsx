import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  // SplashScreen in main.jsx covers the loading state — just render nothing here
  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace={true} />;
  }

  return <Outlet />;
}
