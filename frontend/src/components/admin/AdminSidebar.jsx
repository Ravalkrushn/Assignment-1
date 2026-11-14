import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  QrCode, 
  Gift, 
  CheckSquare, 
  ShieldAlert, 
  BarChart3, 
  Settings, 
  LogOut, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  Factory
} from 'lucide-react';

export default function AdminSidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const { fraudAlerts, logoutUser } = useApp();

  // Count critical or high fraud alerts for badge
  const pendingAlerts = fraudAlerts.filter(a => a.riskLevel === 'Critical' || a.riskLevel === 'High').length;

  const links = [
    { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Customers', to: '/admin/customers', icon: Users },
    { label: 'Products', to: '/admin/products', icon: Package },
    { label: 'Code Management', to: '/admin/codes', icon: QrCode },
    { label: 'Rewards Management', to: '/admin/rewards', icon: Gift },
    { label: 'Redemptions', to: '/admin/redemptions', icon: CheckSquare },
    { label: 'Fraud Monitoring', to: '/admin/fraud-monitoring', icon: ShieldAlert, badge: pendingAlerts },
    { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
    { label: 'Settings', to: '/admin/settings', icon: Settings },
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
        fixed top-0 bottom-0 left-0 z-40 w-72 bg-[#171e19] text-white border-r-2 border-black flex flex-col justify-between transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="overflow-y-auto">
          {/* Logo & Portal title */}
          <div className="h-20 px-6 bg-[#ffe17c] text-black border-b-2 border-black flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-black flex items-center justify-center neo-shadow-sm">
                <Factory className="w-5 h-5 text-[#ffe17c]" />
              </div>
              <div>
                <span className="font-heading font-extrabold text-xl tracking-tight text-black block leading-none">
                  LOYALTY<span className="bg-black text-[#ffe17c] px-1 ml-0.5">BOX</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-800">
                  Factory Owner Admin
                </span>
              </div>
            </Link>
          </div>

          {/* Admin badge info */}
          <div className="p-3.5 bg-[#243028] border-2 border-black m-4 rounded-xl neo-shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400 border border-black animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Live Factory Portal</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#ffe17c] text-black rounded">
                Admin Console
              </span>
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
                    flex items-center justify-between px-3.5 py-2.5 rounded-lg font-heading font-bold text-sm border-2 transition-all
                    ${isActive 
                      ? 'bg-[#ffe17c] border-black text-black neo-shadow-sm translate-x-1' 
                      : 'border-transparent text-[#b7c6c2] hover:bg-[#243028] hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="px-1.5 py-0.5 text-[10px] font-black bg-red-500 text-white rounded-md border border-black">
                      {item.badge}
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 opacity-40" />
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t-2 border-black bg-[#131915] space-y-2">
          {/* Quick link to customer portal */}
          <Link
            to="/customer/dashboard"
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-bold bg-[#ffe17c] text-black border-2 border-black rounded-lg neo-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px]"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Open Customer App
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => {
              logoutUser();
              navigate('/login');
            }}
            className="flex items-center justify-center gap-2 w-full py-2 bg-[#243028] text-white border-2 border-black neo-shadow-sm rounded-lg text-sm hover:bg-neutral-800"
          >
            <LogOut className="w-4 h-4" />
            <span>Admin Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
