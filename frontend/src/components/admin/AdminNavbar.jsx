import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, RotateCcw, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

export default function AdminNavbar({ onToggleSidebar }) {
  const { resetAllDemoData, fraudAlerts } = useApp();

  const handleReset = () => {
    if (window.confirm("Reset all dummy demo data to initial defaults?")) {
      resetAllDemoData();
      toast.success("Demo data reset to factory initial state!", {
        style: { border: '2px solid black', borderRadius: '8px', fontWeight: 'bold' }
      });
    }
  };

  return (
    <header className="h-20 bg-white border-b-2 border-black sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8">
      {/* Left: Hamburger & Plant info */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 bg-[#ffe17c] neo-btn rounded-lg"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5 text-black" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-heading font-black text-lg sm:text-xl text-black">
              Factory Owner Portal
            </span>
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-black rounded">
              Verified Production Plant
            </span>
          </div>
          <p className="text-xs text-neutral-500 hidden sm:block">
            Apex Precision Bearings & Hydraulics Ltd. • Plant #4 (Chakan Industrial Zone)
          </p>
        </div>
      </div>

      {/* Right: Quick actions */}
      <div className="flex items-center gap-3">
        {/* Reset Demo Data Button */}
        <button
          onClick={handleReset}
          title="Reset all demo test data"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#f4f4f0] text-neutral-800 neo-btn rounded-lg hover:bg-neutral-200"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo</span>
        </button>

        {/* Fraud / Alert button */}
        <Link
          to="/admin/fraud-monitoring"
          className="p-2.5 bg-red-50 text-red-700 border-2 border-black rounded-xl neo-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] transition-transform relative"
          title="Fraud Monitoring Alerts"
        >
          <ShieldCheck className="w-4 h-4 text-black" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-black">
            {fraudAlerts.length}
          </span>
        </Link>

        {/* Admin profile pill */}
        <div className="flex items-center gap-2 pl-2 border-l-2 border-black/10">
          <div className="w-9 h-9 rounded-lg bg-black text-[#ffe17c] border-2 border-black flex items-center justify-center font-heading font-bold text-sm">
            FO
          </div>
          <div className="hidden md:block text-left">
            <p className="font-heading font-bold text-xs text-black leading-tight">Harish Patel</p>
            <p className="text-[10px] text-neutral-500 font-semibold">Factory Owner / MD</p>
          </div>
        </div>
      </div>
    </header>
  );
}
