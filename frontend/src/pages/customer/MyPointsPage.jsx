import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Coins, 
  TrendingUp, 
  Clock, 
  Gift, 
  QrCode, 
  Filter 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function MyPointsPage() {
  const { currentUser, transactions } = useApp();
  const [filterType, setFilterType] = useState('ALL');

  const filteredTransactions = transactions.filter(t => {
    if (filterType === 'EARNED') return t.flow === 'EARNED';
    if (filterType === 'SPENT') return t.flow === 'SPENT';
    return true;
  });

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="p-6 sm:p-8 bg-[#ffe17c] border-2 border-black rounded-2xl neo-shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 bg-dots">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-[#ffe17c] text-xs font-black uppercase rounded">
            <Coins className="w-3.5 h-3.5" />
            Wallet & Ledger
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-black">
            My Points Balance
          </h1>
          <p className="text-xs sm:text-sm text-neutral-800 font-medium max-w-xl">
            Complete transparent ledger of all earned reward points from product box codes and reward redemptions.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            to="/customer/redeem-code"
            className="px-5 py-3 bg-black text-[#ffe17c] neo-btn rounded-xl font-heading font-bold text-sm flex items-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            <span>Earn More Points</span>
          </Link>
          <Link
            to="/customer/rewards"
            className="px-5 py-3 bg-white text-black neo-btn rounded-xl font-heading font-bold text-sm flex items-center gap-2"
          >
            <Gift className="w-4 h-4" />
            <span>Spend Points</span>
          </Link>
        </div>
      </div>

      {/* 3 Main Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Available Points */}
        <div className="p-6 bg-white border-2 border-black rounded-2xl neo-shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-neutral-500">Current Balance</span>
            <div className="w-10 h-10 bg-[#ffe17c] border-2 border-black rounded-xl flex items-center justify-center neo-shadow-sm">
              <Coins className="w-5 h-5 text-black" />
            </div>
          </div>
          <div>
            <p className="font-heading font-black text-4xl text-black">
              {currentUser.pointsBalance.toLocaleString()}
            </p>
            <p className="text-xs font-bold text-emerald-700 mt-1">
              Active and ready for immediate catalog redemption
            </p>
          </div>
        </div>

        {/* Total Earned */}
        <div className="p-6 bg-white border-2 border-black rounded-2xl neo-shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-neutral-500">Lifetime Points Earned</span>
            <div className="w-10 h-10 bg-emerald-400 border-2 border-black rounded-xl flex items-center justify-center neo-shadow-sm">
              <TrendingUp className="w-5 h-5 text-black" />
            </div>
          </div>
          <div>
            <p className="font-heading font-black text-4xl text-black">
              {currentUser.totalPointsEarned.toLocaleString()}
            </p>
            <p className="text-xs font-bold text-neutral-600 mt-1">
              Accumulated across {currentUser.boxesRedeemed} scanned product boxes
            </p>
          </div>
        </div>

        {/* Total Redeemed */}
        <div className="p-6 bg-white border-2 border-black rounded-2xl neo-shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-neutral-500">Points Redeemed</span>
            <div className="w-10 h-10 bg-[#b7c6c2] border-2 border-black rounded-xl flex items-center justify-center neo-shadow-sm">
              <Gift className="w-5 h-5 text-black" />
            </div>
          </div>
          <div>
            <p className="font-heading font-black text-4xl text-black">
              {(currentUser.totalPointsRedeemed || 1250).toLocaleString()}
            </p>
            <p className="text-xs font-bold text-neutral-600 mt-1">
              Claimed for discounts, coupons, and factory gifts
            </p>
          </div>
        </div>

      </div>

      {/* Points Expiration Policy Box */}
      <div className="p-5 bg-[#fff8e6] border-2 border-black rounded-2xl neo-shadow flex items-start gap-3">
        <Clock className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-heading font-black text-sm text-black">
            Points Expiration Notice (Sample Policy)
          </p>
          <p className="text-neutral-700 leading-relaxed font-medium">
            Your earned loyalty points remain valid for 12 months from the date of code redemption. Earliest expiration: <strong>350 points expiring on October 31, 2027</strong>.
          </p>
        </div>
      </div>

      {/* Detailed Points Transaction History */}
      <div className="p-6 bg-white border-2 border-black rounded-2xl neo-shadow-lg space-y-6">
        
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black/10 pb-4">
          <div>
            <h3 className="font-heading font-extrabold text-xl text-black">
              Points Ledger History
            </h3>
            <p className="text-xs text-neutral-500 font-medium">
              Every point credit and debit logged cryptographically.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border-2 border-black transition-all ${
                filterType === 'ALL' ? 'bg-[#ffe17c] neo-shadow-sm font-black' : 'bg-white'
              }`}
            >
              All Records
            </button>
            <button
              onClick={() => setFilterType('EARNED')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border-2 border-black transition-all ${
                filterType === 'EARNED' ? 'bg-[#ffe17c] neo-shadow-sm font-black' : 'bg-white'
              }`}
            >
              Earned Only
            </button>
            <button
              onClick={() => setFilterType('SPENT')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border-2 border-black transition-all ${
                filterType === 'SPENT' ? 'bg-[#ffe17c] neo-shadow-sm font-black' : 'bg-white'
              }`}
            >
              Spent Only
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b-2 border-black bg-[#fbfaf5] text-neutral-600 font-black uppercase text-xs">
                <th className="py-3 px-4">Transaction Ref</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Points Change</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 font-medium">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#fbfaf5]">
                  <td className="py-3.5 px-4 font-mono font-bold text-black">{tx.id}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-black block">
                      {tx.type === 'CODE_REDEMPTION' ? tx.productName : tx.rewardName}
                    </span>
                    <span className="text-[11px] text-neutral-500 font-mono">
                      {tx.productCode !== '-' ? `Code: ${tx.productCode}` : 'Catalog Order'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-xs text-neutral-600">
                      {tx.type === 'CODE_REDEMPTION' ? 'Box Code Scan' : 'Reward Redemption'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded font-black text-xs border border-black ${
                      tx.flow === 'EARNED' 
                        ? 'bg-emerald-100 text-emerald-900' 
                        : 'bg-red-100 text-red-900'
                    }`}>
                      {tx.flow === 'EARNED' ? `+${tx.points}` : `-${tx.points}`} PTS
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-neutral-600">{tx.date}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="px-2.5 py-1 text-[11px] font-black uppercase bg-[#f4f4f0] text-black border border-black rounded">
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
