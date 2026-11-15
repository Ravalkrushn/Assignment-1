import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  QrCode, 
  Coins, 
  Gift, 
  History, 
  UserCircle, 
  LogOut, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function CustomerSidebar({ isOpen, setIsOpen }) {
  const { currentUser } = useApp();
  const navigate = useNavigate();

  const links = [
    { label: 'Overview', to: '/customer/dashboard', icon: LayoutDashboard },
    { label: 'Redeem Code', to: '/customer/redeem-code', icon: QrCode, highlight: true },
    { label: 'My Points', to: '/customer/points', icon: Coins },
    { label: 'Rewards Catalog', to: '/customer/rewards', icon: Gift },
    { label: 'Redemption History', to: '/customer/history', icon: History },
    { label: 'Support & Disputes', to: '/customer/support', icon: HelpCircle },
    { label: 'My Profile', to: '/customer/profile', icon: UserCircle },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-72 bg-white border-r-2 border-black flex flex-col justify-between transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div>
          {/* Logo & Portal title */}
          <div className="h-20 px-6 bg-[#ffe17c] border-b-2 border-black flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-black flex items-center justify-center neo-shadow-sm">
                <Sparkles className="w-5 h-5 text-[#ffe17c]" />
              </div>
              <div>
                <span className="font-heading font-extrabold text-xl tracking-tight text-black block leading-none">
                  LOYALTY<span className="bg-black text-[#ffe17c] px-1 ml-0.5">BOX</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-800">
                  Customer Portal
                </span>
              </div>
            </Link>
          </div>

          {/* User quick status banner */}
          <div className="p-4 bg-[#f8f7f2] border-b-2 border-black m-4 rounded-xl neo-shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg border-2 border-black bg-[#ffe17c] flex items-center justify-center font-heading font-black text-xl text-black">
                {currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-heading font-bold text-sm text-black truncate">{currentUser.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-block px-1.5 py-0.2 text-[10px] font-bold bg-[#ffe17c] border border-black rounded">
                    {currentUser.tier}
                  </span>
                  <span className="text-xs font-black text-black">
                    {currentUser.pointsBalance.toLocaleString()} Pts
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 space-y-1.5 mt-2">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => `
                    flex items-center justify-between px-4 py-3 rounded-lg font-heading font-bold text-sm border-2 transition-all
                    ${isActive 
                      ? 'bg-[#ffe17c] border-black text-black neo-shadow-sm translate-x-1' 
                      : 'border-transparent text-neutral-800 hover:bg-neutral-100 hover:border-black/30'
                    }
                    ${item.highlight && !isActive ? 'bg-[#b7c6c2]/25 text-black border-black/20' : ''}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t-2 border-black bg-[#fbfaf5] space-y-2">
          {/* Quick link to admin dashboard */}
          <Link
            to="/admin/dashboard"
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-bold bg-[#b7c6c2] text-black border-2 border-black rounded-lg neo-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px]"
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Switch to Admin Portal
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => {
              navigate('/login');
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-white text-black neo-btn rounded-lg text-sm hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
