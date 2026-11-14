import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, Coins, ChevronDown, User, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function CustomerNavbar({ onToggleSidebar }) {
  const { currentUser } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = [
    { id: 1, title: 'Points Credited', text: '100 points added from bearing box scan', time: '2h ago' },
    { id: 2, title: 'New Reward Available', text: 'Free Hydraulic Seal Pack added to catalog', time: '1d ago' },
    { id: 3, title: 'Tier Upgrade', text: 'You are now a Gold VIP member!', time: '3d ago' }
  ];

  return (
    <header className="h-20 bg-white border-b-2 border-black sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8">
      {/* Left: Mobile hamburger & Welcome */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 bg-[#ffe17c] neo-btn rounded-lg"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5 text-black" />
        </button>

        <div>
          <h2 className="font-heading font-black text-lg sm:text-xl text-black">
            Welcome back, {currentUser.name.split(' ')[0]}! 👋
          </h2>
          <p className="text-xs text-neutral-600 hidden sm:block">
            {currentUser.businessName} • Verified Customer Account
          </p>
        </div>
      </div>

      {/* Right: Points Balance, Notification, Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        
        {/* Points Chip */}
        <Link
          to="/customer/points"
          className="flex items-center gap-2 px-3.5 py-1.5 bg-[#ffe17c] border-2 border-black rounded-xl neo-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] transition-transform"
        >
          <Coins className="w-4 h-4 text-black fill-black" />
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-1.5">
            <span className="font-heading font-black text-sm text-black leading-none">
              {currentUser.pointsBalance.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-black/70">
              PTS
            </span>
          </div>
        </Link>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="p-2.5 bg-white neo-btn rounded-xl relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-black" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border border-black rounded-full" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white neo-card-lg rounded-xl z-50 overflow-hidden animate-in fade-in duration-150">
              <div className="p-3 bg-[#ffe17c] border-b-2 border-black flex items-center justify-between">
                <span className="font-heading font-bold text-sm text-black">Activity Notifications</span>
                <span className="text-[10px] font-bold bg-black text-[#ffe17c] px-1.5 py-0.5 rounded">3 New</span>
              </div>
              <div className="divide-y divide-black/10 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-[#fbfaf5] transition-colors">
                    <p className="font-heading font-bold text-xs text-black">{n.title}</p>
                    <p className="text-xs text-neutral-600 mt-0.5">{n.text}</p>
                    <span className="text-[10px] text-neutral-400 mt-1 block">{n.time}</span>
                  </div>
                ))}
              </div>
              <div className="p-2 bg-neutral-50 border-t-2 border-black text-center">
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-bold text-black hover:underline"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1.5 bg-white neo-btn rounded-xl"
          >
            <div className="w-8 h-8 rounded-lg bg-black text-[#ffe17c] flex items-center justify-center font-heading font-bold text-sm">
              {currentUser.name.charAt(0)}
            </div>
            <ChevronDown className="w-4 h-4 text-black hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-56 bg-white neo-card-lg rounded-xl z-50 overflow-hidden animate-in fade-in duration-150">
              <div className="p-4 bg-[#f8f7f2] border-b-2 border-black">
                <p className="font-heading font-bold text-sm text-black truncate">{currentUser.name}</p>
                <p className="text-xs text-neutral-500 truncate">{currentUser.email}</p>
                <span className="inline-block mt-2 px-2 py-0.5 bg-[#ffe17c] text-black text-[10px] font-bold border border-black rounded">
                  {currentUser.tier}
                </span>
              </div>
              <div className="p-2 space-y-1">
                <Link
                  to="/customer/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-neutral-700 hover:bg-[#ffe17c] hover:text-black rounded-lg transition-colors"
                >
                  <User className="w-4 h-4" /> My Profile
                </Link>
                <Link
                  to="/login"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </Link>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
