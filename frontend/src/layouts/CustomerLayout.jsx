import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import CustomerSidebar from '../components/customer/CustomerSidebar';
import CustomerNavbar from '../components/customer/CustomerNavbar';

export default function CustomerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fcfbf7] flex">
      {/* Sidebar navigation */}
      <CustomerSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        <CustomerNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
