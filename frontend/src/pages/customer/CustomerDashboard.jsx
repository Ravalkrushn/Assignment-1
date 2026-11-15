import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Coins, 
  Package, 
  Gift, 
  QrCode, 
  ArrowRight, 
  TrendingUp, 
  Sparkles, 
  ArrowUpRight, 
  ShieldCheck,
  Flame
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { customerPointsHistoryChart } from '../../data/dummyAnalytics';

export default function CustomerDashboard() {
  const { currentUser, transactions } = useApp();
  const [activeCampaigns, setActiveCampaigns] = useState([]);

  useEffect(() => {
    api.campaigns.getAll({ status: 'Active' })
      .then(res => {
        if (res?.success && Array.isArray(res?.data?.campaigns)) {
          setActiveCampaigns(res.data.campaigns);
        }
      })
      .catch(() => {});
  }, []);

  // Get recent 4 transactions for this customer
  const recentTransactions = transactions.slice(0, 4);

  const stats = [
    {
      label: "Available Points",
      value: currentUser.pointsBalance.toLocaleString(),
      subtext: "Ready to redeem",
      icon: Coins,
      bg: "#ffe17c",
      textColor: "text-black",
      border: "border-black"
    },
    {
      label: "Total Points Earned",
      value: currentUser.totalPointsEarned.toLocaleString(),
      subtext: "Lifetime accumulation",
      icon: TrendingUp,
      bg: "#ffffff",
      textColor: "text-black",
      border: "border-black"
    },
    {
      label: "Redeemed Rewards",
      value: "5 Items",
      subtext: "Coupons & Factory Gifts",
      icon: Gift,
      bg: "#b7c6c2",
      textColor: "text-black",
      border: "border-black"
    },
    {
      label: "Products Scanned",
      value: `${currentUser.boxesRedeemed} Boxes`,
      subtext: "100% genuine parts",
      icon: Package,
      bg: "#ffffff",
      textColor: "text-black",
      border: "border-black"
    }
  ];

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black text-white p-3 border-2 border-black rounded-lg text-xs neo-shadow-sm font-body">
          <p className="font-heading font-bold text-[#ffe17c] mb-1">{label} 2026</p>
          <p className="font-medium text-emerald-400">Earned: +{payload[0].value} pts</p>
          {payload[1] && <p className="font-medium text-amber-300">Spent: -{payload[1].value} pts</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner / Welcome */}
      <div className="p-6 sm:p-8 bg-[#ffe17c] border-2 border-black rounded-2xl neo-shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 bg-dots">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-[#ffe17c] text-xs font-black uppercase rounded">
            <Sparkles className="w-3.5 h-3.5" />
            Verified Customer Dashboard
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-black">
            Welcome back, {currentUser.name}!
          </h1>
          <p className="text-xs sm:text-sm text-neutral-800 font-medium max-w-xl">
            {currentUser.businessName} • You are currently enjoying <strong>{currentUser.tier}</strong> privileges with <strong>{currentUser.pointsBalance.toLocaleString()} points</strong> ready for redemption.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/customer/redeem-code"
            className="px-5 py-3 bg-black text-[#ffe17c] neo-btn rounded-xl font-heading font-bold text-sm flex items-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            <span>Redeem Box Code</span>
          </Link>
          <Link
            to="/customer/rewards"
            className="px-5 py-3 bg-white text-black neo-btn rounded-xl font-heading font-bold text-sm flex items-center gap-2"
          >
            <Gift className="w-4 h-4" />
            <span>Browse Rewards</span>
          </Link>
        </div>
      </div>

      {/* Active Marketing Campaigns Banner */}
      {activeCampaigns.length > 0 && (
        <div className="p-5 bg-[#171e19] text-white border-2 border-black rounded-2xl neo-shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 border-[#ffe17c] overflow-hidden neo-shadow-sm flex-shrink-0 bg-black">
              <img
                src="https://images.unsplash.com/photo-1513151233558-d860c5398176?w=240&auto=format&fit=crop&q=80"
                alt="Loyalty Campaign Booster"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-red-500 text-white font-black text-[10px] uppercase rounded border border-black">
                <Flame className="w-3 h-3 fill-current" />
                Limited-Time Loyalty Booster Active
              </div>
              <h3 className="font-heading font-black text-lg text-[#ffe17c]">
                {activeCampaigns[0].title}
              </h3>
              <p className="text-xs text-[#b7c6c2]">
                {activeCampaigns[0].bannerText || activeCampaigns[0].description || 'Redeem any eligible product box now to earn bonus points and boost your reward points!'}
              </p>
            </div>
          </div>
          <Link
            to="/customer/redeem-code"
            className="px-4 py-2.5 bg-[#ffe17c] text-black font-black text-xs uppercase rounded-xl border-2 border-black neo-btn flex-shrink-0 text-center"
          >
            Scan & Earn Boost &rarr;
          </Link>
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="p-5 border-2 border-black rounded-xl neo-shadow space-y-3 flex flex-col justify-between"
              style={{ backgroundColor: s.bg }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-black/70">
                  {s.label}
                </span>
                <div className="w-9 h-9 bg-black text-[#ffe17c] rounded-lg border border-black flex items-center justify-center neo-shadow-sm">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="font-heading font-black text-3xl text-black">{s.value}</p>
                <p className="text-xs font-bold text-neutral-700 mt-0.5">{s.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Chart & Reward Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Points Trend Chart (8 cols) */}
        <div className="lg:col-span-8 p-6 bg-white border-2 border-black rounded-2xl neo-shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-black/10 pb-4">
            <div>
              <h3 className="font-heading font-extrabold text-xl text-black flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-black" />
                Points Velocity Overview (Last 6 Months)
              </h3>
              <p className="text-xs text-neutral-500 font-medium">
                Monthly points earned from genuine box codes vs. points redeemed for rewards.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[#ffe17c] border border-black rounded-sm" /> Points Earned
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-neutral-400 border border-black rounded-sm" /> Spent
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={customerPointsHistoryChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="yellowEarned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffe17c" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ffe17c" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="month" stroke="#171e19" tick={{ fontSize: 12, fontWeight: 600 }} />
                <YAxis stroke="#171e19" tick={{ fontSize: 12, fontWeight: 600 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="pointsEarned" 
                  stroke="#000000" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="#ffe17c" 
                />
                <Area 
                  type="monotone" 
                  dataKey="pointsRedeemed" 
                  stroke="#171e19" 
                  strokeWidth={2} 
                  strokeDasharray="4 4"
                  fillOpacity={0.2} 
                  fill="#b7c6c2" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Reward Progress & Tier (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Reward Progress Card */}
          <div className="p-6 bg-[#ffe17c] border-2 border-black rounded-2xl neo-shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider bg-black text-[#ffe17c] px-2 py-0.5 rounded">
                Next Milestone
              </span>
              <Gift className="w-5 h-5 text-black" />
            </div>

            <div className="h-28 w-full rounded-xl border-2 border-black overflow-hidden neo-shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=80"
                alt="Premium Factory Gift Box reward target"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h4 className="font-heading font-black text-xl text-black">
                Premium Factory Gift Box
              </h4>
              <p className="text-xs text-neutral-800 font-medium mt-1">
                Target: 1,500 points (Current: {currentUser.pointsBalance.toLocaleString()} pts)
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-4 bg-white border-2 border-black rounded-full overflow-hidden p-0.5">
                <div 
                  className="h-full bg-black rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (currentUser.pointsBalance / 1500) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-extrabold text-neutral-900">
                <span>{Math.round((currentUser.pointsBalance / 1500) * 100)}% Reached</span>
                <span>Needs 250 more pts</span>
              </div>
            </div>

            <div className="p-3 bg-white/70 border border-black rounded-xl text-xs font-bold text-neutral-800">
              ⚡ Scan just <strong>2 more bearing boxes</strong> or <strong>1 CNC drill bit set</strong> to unlock this reward!
            </div>

            <Link
              to="/customer/redeem-code"
              className="w-full py-2.5 bg-black text-[#ffe17c] neo-btn rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <span>Scan Box Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Quick Authenticity Notice */}
          <div className="p-5 bg-white border-2 border-black rounded-2xl neo-shadow space-y-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Genuine Box Guarantee
            </div>
            <p className="text-xs text-neutral-600 font-medium leading-relaxed">
              Every code scanned is cross-referenced with the factory's serialized production batch. 
            </p>
          </div>

        </div>

      </div>

      {/* Recent Activity Table */}
      <div className="p-6 bg-white border-2 border-black rounded-2xl neo-shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b-2 border-black/10 pb-4">
          <div>
            <h3 className="font-heading font-extrabold text-xl text-black">
              Recent Activity
            </h3>
            <p className="text-xs text-neutral-500 font-medium">
              Your latest product box code redemptions and reward claims.
            </p>
          </div>
          <Link
            to="/customer/history"
            className="text-xs font-bold text-black flex items-center gap-1 hover:underline"
          >
            <span>View All History</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-black text-xs font-black uppercase text-neutral-600 bg-[#fbfaf5]">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Activity Description</th>
                <th className="py-3 px-4">Code / Reward</th>
                <th className="py-3 px-4">Points</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 text-xs sm:text-sm font-medium">
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#fbfaf5] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-black">
                    {tx.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-black block">
                      {tx.type === 'CODE_REDEMPTION' ? tx.productName : tx.rewardName}
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {tx.type === 'CODE_REDEMPTION' ? 'Product Box Code Scan' : 'Reward Catalog Redemption'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-neutral-700">
                    {tx.productCode !== '-' ? tx.productCode : tx.rewardName}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded font-black text-xs border border-black ${
                      tx.flow === 'EARNED' 
                        ? 'bg-[#ffe17c] text-black' 
                        : 'bg-neutral-200 text-neutral-800'
                    }`}>
                      {tx.flow === 'EARNED' ? `+${tx.points}` : `-${tx.points}`} PTS
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-neutral-600 text-xs">
                    {tx.date}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-block px-2.5 py-1 text-[11px] font-black uppercase bg-emerald-100 text-emerald-800 border border-black rounded-md">
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
