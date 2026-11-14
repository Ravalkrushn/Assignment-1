import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Package, 
  QrCode, 
  CheckSquare, 
  Coins, 
  Gift, 
  ArrowUpRight, 
  BarChart3,
  Factory,
  Plus
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { adminMonthlyGrowth, popularRewardsData } from '../../data/dummyAnalytics';

export default function AdminDashboard() {
  const { customers, products, codes, rewards, transactions, fraudAlerts } = useApp();

  const totalCodesCount = 50000;
  const redeemedCodesCount = 12500;
  const pointsDistributed = 125000;
  const totalRewardsRedeemed = 2500;

  const adminStats = [
    {
      label: "Total Customers",
      value: "5,000",
      subtext: "+14% this month",
      icon: Users,
      bg: "#ffe17c"
    },
    {
      label: "Total Products",
      value: "125 SKUs",
      subtext: `${products.length} active in demo catalog`,
      icon: Package,
      bg: "#ffffff"
    },
    {
      label: "Generated Codes",
      value: totalCodesCount.toLocaleString(),
      subtext: "Tamper-evident batch series",
      icon: QrCode,
      bg: "#ffffff"
    },
    {
      label: "Redeemed Codes",
      value: redeemedCodesCount.toLocaleString(),
      subtext: "25% redemption conversion",
      icon: CheckSquare,
      bg: "#b7c6c2"
    },
    {
      label: "Points Distributed",
      value: pointsDistributed.toLocaleString(),
      subtext: "Total loyalty liability issued",
      icon: Coins,
      bg: "#ffe17c"
    },
    {
      label: "Rewards Claimed",
      value: totalRewardsRedeemed.toLocaleString(),
      subtext: "Coupons & gifts dispatched",
      icon: Gift,
      bg: "#ffffff"
    }
  ];

  // Custom Tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#171e19] text-white p-3 border-2 border-black rounded-lg text-xs neo-shadow-sm font-body">
          <p className="font-heading font-bold text-[#ffe17c] mb-1">{label} 2026</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="font-medium">
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="p-6 sm:p-8 bg-[#171e19] text-white border-2 border-black rounded-2xl neo-shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ffe17c] text-black text-xs font-black uppercase rounded">
            <Factory className="w-3.5 h-3.5" />
            Executive Factory Overview
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-white">
            Factory Rewards & Security Command Center
          </h1>
          <p className="text-xs sm:text-sm text-[#b7c6c2] font-medium max-w-xl">
            Real-time monitoring of box packaging codes, dealer redemptions, customer point balances, and suspicious scan patterns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/codes"
            className="px-4 py-2.5 bg-[#ffe17c] text-black neo-btn rounded-xl font-heading font-bold text-xs sm:text-sm flex items-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            <span>Generate Codes</span>
          </Link>
          <Link
            to="/admin/products"
            className="px-4 py-2.5 bg-white text-black neo-btn rounded-xl font-heading font-bold text-xs sm:text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* 6 Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {adminStats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="p-4 border-2 border-black rounded-xl neo-shadow space-y-2 flex flex-col justify-between"
              style={{ backgroundColor: s.bg }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-black/70">
                  {s.label}
                </span>
                <div className="w-7 h-7 bg-black text-[#ffe17c] rounded-md flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <p className="font-heading font-black text-2xl text-black">{s.value}</p>
                <p className="text-[10px] font-bold text-neutral-600">{s.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts (Two Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Code Redemptions & Growth Trend (7 cols) */}
        <div className="lg:col-span-7 bg-white border-2 border-black rounded-2xl neo-shadow-lg p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-black/10 pb-4">
            <div>
              <h3 className="font-heading font-extrabold text-lg sm:text-xl text-black flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-black" />
                Monthly Code Redemptions & Customer Growth
              </h3>
              <p className="text-xs text-neutral-500 font-medium">
                Velocity of unique box codes redeemed across all distribution zones.
              </p>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={adminMonthlyGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="month" stroke="#171e19" tick={{ fontSize: 11, fontWeight: 700 }} />
                <YAxis stroke="#171e19" tick={{ fontSize: 11, fontWeight: 700 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="codesRedeemed" name="Codes Scanned" fill="#171e19" radius={[4, 4, 0, 0]} />
                <Bar dataKey="newCustomers" name="New Customers" fill="#ffe17c" stroke="#000" strokeWidth={1} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Popular Rewards Distribution (5 cols) */}
        <div className="lg:col-span-5 bg-white border-2 border-black rounded-2xl neo-shadow-lg p-6 space-y-6">
          <div className="border-b-2 border-black/10 pb-4">
            <h3 className="font-heading font-extrabold text-lg sm:text-xl text-black flex items-center gap-2">
              <Gift className="w-5 h-5 text-black" />
              Most Popular Rewards
            </h3>
            <p className="text-xs text-neutral-500 font-medium">
              Customer preference breakdown across reward categories.
            </p>
          </div>

          <div className="space-y-3.5">
            {popularRewardsData.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-black">
                  <span>{item.name}</span>
                  <span className="text-neutral-500">{item.redemptions} ({item.percentage}%)</span>
                </div>
                <div className="w-full h-3 bg-neutral-100 border border-black rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#ffe17c] border-r border-black" 
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#fbfaf5] border border-black rounded-xl flex items-center justify-between text-xs font-bold">
            <span className="text-neutral-700">Explore complete catalog analytics</span>
            <Link to="/admin/analytics" className="text-black underline font-black">
              View Insights →
            </Link>
          </div>
        </div>

      </div>

      {/* Two Column Grid: Recent Registrations & Recent Redemptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Customer Registrations */}
        <div className="bg-white border-2 border-black rounded-2xl neo-shadow-lg p-6 space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
            <h3 className="font-heading font-extrabold text-lg text-black flex items-center gap-2">
              <Users className="w-4 h-4 text-black" />
              Recent Customer Registrations
            </h3>
            <Link to="/admin/customers" className="text-xs font-bold text-black hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-black/10 text-xs">
            {customers.slice(0, 4).map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-black text-sm">{c.name}</p>
                  <p className="text-neutral-500">{c.businessName} • {c.city}, {c.state}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 bg-[#ffe17c] border border-black rounded font-black text-[10px]">
                    {c.pointsBalance} PTS
                  </span>
                  <span className="block text-[10px] text-neutral-400 mt-0.5">{c.registeredDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Redemptions Feed */}
        <div className="bg-white border-2 border-black rounded-2xl neo-shadow-lg p-6 space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
            <h3 className="font-heading font-extrabold text-lg text-black flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-black" />
              Live Box Redemptions Feed
            </h3>
            <Link to="/admin/redemptions" className="text-xs font-bold text-black hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-black/10 text-xs">
            {transactions.slice(0, 4).map((t) => (
              <div key={t.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-black">{t.customerName}</span>
                    <span className="text-[10px] font-mono text-neutral-400">{t.id}</span>
                  </div>
                  <p className="text-neutral-500 font-mono text-[11px]">
                    {t.type === 'CODE_REDEMPTION' ? `Code: ${t.productCode}` : `Claim: ${t.rewardName}`}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-0.5 rounded font-black text-[10px] border border-black ${
                    t.flow === 'EARNED' ? 'bg-emerald-100 text-emerald-900' : 'bg-purple-100 text-purple-900'
                  }`}>
                    {t.flow === 'EARNED' ? `+${t.points}` : `-${t.points}`} PTS
                  </span>
                  <span className="block text-[10px] text-neutral-400 mt-0.5">{t.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
