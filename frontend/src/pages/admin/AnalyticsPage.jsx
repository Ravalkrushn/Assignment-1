import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package, 
  Coins, 
  Gift, 
  Award,
  ArrowUpRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { 
  adminMonthlyGrowth, 
  popularRewardsData, 
  productRedemptionPerformance as fallbackPerformance 
} from '../../data/dummyAnalytics';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export default function AnalyticsPage() {
  const { customers } = useApp();
  const [productRedemptionPerformance, setProductRedemptionPerformance] = useState(fallbackPerformance);

  useEffect(() => {
    api.analytics.getProducts()
      .then(res => {
        if (res?.success && Array.isArray(res?.data?.products) && res.data.products.length > 0) {
          setProductRedemptionPerformance(res.data.products.map(p => ({
            name: p.name || p.productName,
            generated: p.generated || 0,
            redeemed: p.redeemed || 0,
            rate: p.yieldRate || '0%'
          })));
        }
      })
      .catch(() => {});
  }, []);

  // Custom chart tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black text-white p-3 border-2 border-black rounded-lg text-xs neo-shadow-sm font-body">
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
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-[#ffe17c] border-2 border-black rounded-2xl neo-shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 bg-dots">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-[#ffe17c] text-xs font-black uppercase rounded">
            <BarChart3 className="w-3.5 h-3.5" />
            Executive Business Intelligence
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-black">
            Analytics & Reports
          </h1>
          <p className="text-xs sm:text-sm text-neutral-800 font-medium max-w-xl">
            In-depth statistical breakdown of customer acquisition velocity, loyalty liability points distributed, and physical SKU redemption yield.
          </p>
        </div>

        <div className="p-4 bg-white border-2 border-black rounded-xl neo-shadow flex items-center gap-3">
          <Award className="w-8 h-8 text-black" />
          <div>
            <span className="text-[10px] font-black uppercase text-neutral-500 block">Overall Conversion</span>
            <span className="font-heading font-black text-2xl text-black">74.2%</span>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 1: Monthly Points Liability Issued */}
        <div className="bg-white border-2 border-black rounded-2xl neo-shadow-lg p-6 space-y-4">
          <div className="border-b-2 border-black/10 pb-3">
            <h3 className="font-heading font-extrabold text-xl text-black flex items-center gap-2">
              <Coins className="w-5 h-5 text-black" />
              Monthly Points Distributed
            </h3>
            <p className="text-xs text-neutral-500 font-medium">
              Total loyalty liability points credited from verified box codes.
            </p>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={adminMonthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="month" stroke="#171e19" tick={{ fontSize: 11, fontWeight: 700 }} />
                <YAxis stroke="#171e19" tick={{ fontSize: 11, fontWeight: 700 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="pointsGiven" 
                  name="Points Issued" 
                  stroke="#000000" 
                  strokeWidth={2.5} 
                  fill="#ffe17c" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Customer Acquisition & Scan Growth */}
        <div className="bg-white border-2 border-black rounded-2xl neo-shadow-lg p-6 space-y-4">
          <div className="border-b-2 border-black/10 pb-3">
            <h3 className="font-heading font-extrabold text-xl text-black flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-black" />
              Customer Signups & Code Scans
            </h3>
            <p className="text-xs text-neutral-500 font-medium">
              Comparison between new user onboarding and box scan engagement.
            </p>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={adminMonthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="month" stroke="#171e19" tick={{ fontSize: 11, fontWeight: 700 }} />
                <YAxis stroke="#171e19" tick={{ fontSize: 11, fontWeight: 700 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="codesRedeemed" 
                  name="Codes Redeemed" 
                  stroke="#171e19" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#171e19' }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="newCustomers" 
                  name="New Signups" 
                  stroke="#ff5c5c" 
                  strokeWidth={2.5} 
                  dot={{ r: 4, fill: '#ff5c5c' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Two Data Tables: Product Yield & Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Product Code Yield */}
        <div className="bg-white border-2 border-black rounded-2xl neo-shadow-lg p-6 space-y-4">
          <div className="border-b-2 border-black/10 pb-3">
            <h3 className="font-heading font-extrabold text-lg text-black flex items-center gap-2">
              <Package className="w-4 h-4 text-black" />
              Box Packaging SKU Redemption Yield
            </h3>
            <p className="text-xs text-neutral-500 font-medium">
              Percentage of manufactured boxes actually scanned by customers.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-black bg-[#fbfaf5] text-neutral-600 font-black uppercase">
                  <th className="py-2.5 px-3">Product SKU</th>
                  <th className="py-2.5 px-3">Printed</th>
                  <th className="py-2.5 px-3">Redeemed</th>
                  <th className="py-2.5 px-3 text-right">Yield Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10 font-medium">
                {productRedemptionPerformance.map((p, idx) => (
                  <tr key={idx} className="hover:bg-[#fbfaf5]">
                    <td className="py-3 px-3 font-bold text-black">{p.name}</td>
                    <td className="py-3 px-3 font-mono">{p.generated.toLocaleString()}</td>
                    <td className="py-3 px-3 font-mono text-emerald-800 font-bold">{p.redeemed.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2 py-0.5 bg-[#ffe17c] text-black border border-black rounded font-black">
                        {p.rate}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Loyal Customers */}
        <div className="bg-white border-2 border-black rounded-2xl neo-shadow-lg p-6 space-y-4">
          <div className="border-b-2 border-black/10 pb-3">
            <h3 className="font-heading font-extrabold text-lg text-black flex items-center gap-2">
              <Users className="w-4 h-4 text-black" />
              Top Repeat Purchasing Customers
            </h3>
            <p className="text-xs text-neutral-500 font-medium">
              Workshops with the highest lifetime scanned box volume.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-black bg-[#fbfaf5] text-neutral-600 font-black uppercase">
                  <th className="py-2.5 px-3">Client</th>
                  <th className="py-2.5 px-3">Tier</th>
                  <th className="py-2.5 px-3">Total Earned</th>
                  <th className="py-2.5 px-3 text-right">Boxes Scanned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10 font-medium">
                {(Array.isArray(customers) ? customers : []).slice(0, 5).map((c) => (
                  <tr key={c.id || c._id} className="hover:bg-[#fbfaf5]">
                    <td className="py-3 px-3">
                      <p className="font-bold text-black">{c.name || c.fullName || 'Customer'}</p>
                      <p className="text-[10px] text-neutral-500">{c.businessName || 'Workshop'}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-1.5 py-0.5 bg-[#f4f4f0] border border-black rounded text-[10px] font-bold">
                        {c.tier || 'Bronze'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-black">
                      {(c.totalPointsEarned ?? 0).toLocaleString()} PTS
                    </td>
                    <td className="py-3 px-3 text-right font-black text-black">
                      {c.boxesRedeemed ?? 0} Boxes
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
