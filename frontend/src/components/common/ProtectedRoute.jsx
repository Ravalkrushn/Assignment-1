import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

/**
 * ProtectedRoute Component
 * Enforces authentication and role-based access control (RBAC).
 * Handles loading state, unauthenticated redirects, and role mismatch routing.
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { currentUser, isAuthLoading } = useApp();
  const location = useLocation();

  // Prevent UI flashing while checking authentication tokens on initial load
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#fcfbf7] flex items-center justify-center p-4">
        <div className="p-6 bg-white border-2 border-black rounded-2xl neo-shadow flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-black border-t-[#ffe17c] rounded-full animate-spin" />
          <span className="text-xs font-black uppercase tracking-wider text-black">
            Verifying Authorization...
          </span>
        </div>
      </div>
    );
  }

  // Unauthenticated visitors are redirected to Login with return location
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Enforce required role
  if (requiredRole && currentUser.role !== requiredRole) {
    // Customer attempting to view Admin Portal
    if (requiredRole === 'admin') {
      return <Navigate to="/customer/dashboard" replace />;
    }
    // Admin attempting to view Customer Portal
    if (requiredRole === 'customer') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}
