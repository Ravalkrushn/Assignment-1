import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import CustomerSidebar from '../components/customer/CustomerSidebar';
import CustomerNavbar from '../components/customer/CustomerNavbar';
import ErrorBoundary from '../components/common/ErrorBoundary';

export default function CustomerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, isAuthLoading } = useApp();
  const location = useLocation();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#fcfbf7] flex items-center justify-center p-4">
        <div className="p-6 bg-white border-2 border-black rounded-2xl neo-shadow flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-black border-t-[#ffe17c] rounded-full animate-spin" />
          <span className="text-xs font-black uppercase tracking-wider text-black">
            Loading Customer Portal...
          </span>
        </div>
      </div>
    );
  }

  // Reject unauthenticated access
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-[#fcfbf7] flex">
      {/* Sidebar navigation */}
      <CustomerSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        <CustomerNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
