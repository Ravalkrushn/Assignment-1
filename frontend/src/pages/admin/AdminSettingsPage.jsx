import React, { useState } from 'react';
import { 
  Settings, 
  Factory, 
  ShieldCheck, 
  Sliders, 
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const { resetAllDemoData } = useApp();

  const [factoryConfig, setFactoryConfig] = useState({
    plantName: 'Apex Precision Bearings & Hydraulics Ltd.',
    plantCode: 'PLANT-PUNE-04',
    contactEmail: 'admin@apexcomponents.in',
    contactPhone: '+91 20 6712 3456',
    address: 'Plot 42, Sector 10, Chakan Industrial Area, Pune 410501'
  });

  const [loyaltyConfig, setLoyaltyConfig] = useState({
    pointsExpiryMonths: 12,
    defaultPointsPerBox: 100,
    signupBonusPoints: 100,
    autoApproveRewardUnder: 500
  });

  const [fraudConfig, setFraudConfig] = useState({
    maxScansPerMinute: 5,
    maxFailedAttemptsBeforeLock: 3,
    enforceStrictGeoVerification: true,
    requireInvoiceForWholesalers: true
  });

  const handleSaveFactory = (e) => {
    e.preventDefault();
    toast.success('Factory plant profile updated successfully!');
  };

  const handleSaveLoyalty = (e) => {
    e.preventDefault();
    toast.success('Loyalty parameters and reward policies updated!');
  };

  const handleSaveFraud = (e) => {
    e.preventDefault();
    toast.success('Security thresholds and rate limits updated!');
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all simulated codes, transactions, and product states to defaults?")) {
      resetAllDemoData();
      toast.success("All demo data reset to default factory state!", {
        style: { border: '2px solid black', borderRadius: '8px', fontWeight: 'bold' }
      });
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-[#ffe17c] border-2 border-black rounded-2xl neo-shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 bg-dots">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-[#ffe17c] text-xs font-black uppercase rounded">
            <Settings className="w-3.5 h-3.5" />
            System Configuration
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-black">
            Platform Settings & Rules
          </h1>
          <p className="text-xs sm:text-sm text-neutral-800 font-medium max-w-xl">
            Configure factory facility credentials, points accrual lifecycle rules, and automated rate-limiting security parameters.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-5 py-3 bg-red-600 text-white neo-btn rounded-xl font-heading font-bold text-sm flex items-center gap-2 hover:bg-red-700"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset All Demo Data</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Factory Profile */}
        <div className="bg-white border-2 border-black rounded-2xl neo-shadow-lg p-6 space-y-5">
          <div className="border-b-2 border-black/10 pb-3 flex items-center gap-2">
            <Factory className="w-5 h-5 text-black" />
            <h3 className="font-heading font-extrabold text-lg text-black">
              Factory Manufacturing Plant
            </h3>
          </div>

          <form onSubmit={handleSaveFactory} className="space-y-3.5">
            <div className="space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider text-black">
                Facility Name
              </label>
              <input
                type="text"
                value={factoryConfig.plantName}
                onChange={(e) => setFactoryConfig({ ...factoryConfig, plantName: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white neo-input rounded-xl text-black font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-black uppercase tracking-wider text-black">
                  Plant Code
                </label>
                <input
                  type="text"
                  value={factoryConfig.plantCode}
                  onChange={(e) => setFactoryConfig({ ...factoryConfig, plantCode: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white neo-input rounded-xl text-black font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black uppercase tracking-wider text-black">
                  Dispatch Helpline
                </label>
                <input
                  type="text"
                  value={factoryConfig.contactPhone}
                  onChange={(e) => setFactoryConfig({ ...factoryConfig, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white neo-input rounded-xl text-black font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider text-black">
                Official Plant Address
              </label>
              <textarea
                rows={2}
                value={factoryConfig.address}
                onChange={(e) => setFactoryConfig({ ...factoryConfig, address: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white neo-input rounded-xl text-black font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#ffe17c] text-black neo-btn rounded-xl text-xs font-black"
            >
              Save Plant Details
            </button>
          </form>
        </div>

        {/* Loyalty Rules Configuration */}
        <div className="bg-white border-2 border-black rounded-2xl neo-shadow-lg p-6 space-y-5">
          <div className="border-b-2 border-black/10 pb-3 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-black" />
            <h3 className="font-heading font-extrabold text-lg text-black">
              Loyalty Accrual Policies
            </h3>
          </div>

          <form onSubmit={handleSaveLoyalty} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-black uppercase tracking-wider text-black">
                  Points Validity (Months)
                </label>
                <input
                  type="number"
                  value={loyaltyConfig.pointsExpiryMonths}
                  onChange={(e) => setLoyaltyConfig({ ...loyaltyConfig, pointsExpiryMonths: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-white neo-input rounded-xl text-black font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black uppercase tracking-wider text-black">
                  Default Points / Box
                </label>
                <input
                  type="number"
                  value={loyaltyConfig.defaultPointsPerBox}
                  onChange={(e) => setLoyaltyConfig({ ...loyaltyConfig, defaultPointsPerBox: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-white neo-input rounded-xl text-black font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-black uppercase tracking-wider text-black">
                  Signup Bonus (PTS)
                </label>
                <input
                  type="number"
                  value={loyaltyConfig.signupBonusPoints}
                  onChange={(e) => setLoyaltyConfig({ ...loyaltyConfig, signupBonusPoints: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-white neo-input rounded-xl text-black font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black uppercase tracking-wider text-black">
                  Auto-Fulfill Threshold
                </label>
                <input
                  type="number"
                  value={loyaltyConfig.autoApproveRewardUnder}
                  onChange={(e) => setLoyaltyConfig({ ...loyaltyConfig, autoApproveRewardUnder: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-white neo-input rounded-xl text-black font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#ffe17c] text-black neo-btn rounded-xl text-xs font-black"
            >
              Update Program Policies
            </button>
          </form>
        </div>

      </div>

      {/* Security Threat Thresholds */}
      <div className="bg-white border-2 border-black rounded-2xl neo-shadow-lg p-6 space-y-5">
        <div className="border-b-2 border-black/10 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-black" />
            <h3 className="font-heading font-extrabold text-lg text-black">
              Anti-Fraud Heuristic Defense Parameters
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-black rounded">
            Active Guardrails
          </span>
        </div>

        <form onSubmit={handleSaveFraud} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-[#fbfaf5] border border-black rounded-xl space-y-2">
              <label className="block text-xs font-bold text-black">
                Max Code Scan Rate (per minute per IP)
              </label>
              <input
                type="number"
                value={fraudConfig.maxScansPerMinute}
                onChange={(e) => setFraudConfig({ ...fraudConfig, maxScansPerMinute: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-white neo-input rounded-xl text-black font-medium"
              />
              <p className="text-[11px] text-neutral-500">Exceeding this triggers automated 15-minute cooldown.</p>
            </div>

            <div className="p-4 bg-[#fbfaf5] border border-black rounded-xl space-y-2">
              <label className="block text-xs font-bold text-black">
                Max Consecutive Failed Verification Attempts
              </label>
              <input
                type="number"
                value={fraudConfig.maxFailedAttemptsBeforeLock}
                onChange={(e) => setFraudConfig({ ...fraudConfig, maxFailedAttemptsBeforeLock: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-white neo-input rounded-xl text-black font-medium"
              />
              <p className="text-[11px] text-neutral-500">Locks code redemption input on suspected brute force.</p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-black text-[#ffe17c] neo-btn rounded-xl text-xs font-bold"
            >
              Save Security Rules
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
