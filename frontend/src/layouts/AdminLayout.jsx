import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminNavbar from '../components/admin/AdminNavbar';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, isAuthLoading } = useApp();
  const location = useLocation();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#f7f6f0] flex items-center justify-center p-4">
        <div className="p-6 bg-white border-2 border-black rounded-2xl neo-shadow flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-black border-t-[#ffe17c] rounded-full animate-spin" />
          <span className="text-xs font-black uppercase tracking-wider text-black">
            Verifying Admin Authorization...
          </span>
        </div>
      </div>
    );
  }

  // Reject unauthenticated access
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Reject non-admin access to Admin Portal
  if (currentUser.role !== 'admin') {
    return <Navigate to="/customer/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[#f7f6f0] flex">
      {/* Admin Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Admin Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        <AdminNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
