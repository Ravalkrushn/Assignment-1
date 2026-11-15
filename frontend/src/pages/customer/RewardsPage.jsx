import React, { useState } from 'react';
import { 
  Gift, 
  Coins, 
  ArrowRight, 
  Ticket, 
  Tag, 
  Package, 
  ShieldCheck, 
  Briefcase, 
  CreditCard, 
  Wrench,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

// Reward image with fallback
function RewardCardImage({ src, alt, category, icon: Icon }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="h-36 w-full bg-[#f8f7f2] border-2 border-black rounded-xl flex items-center justify-center neo-shadow-sm p-4 text-center">
        <div className="space-y-1">
          <div className="w-12 h-12 bg-black text-[#ffe17c] mx-auto rounded-xl flex items-center justify-center border border-black">
            <Icon className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold text-neutral-500 block uppercase">
            {category}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-36 w-full bg-neutral-100 border-2 border-black rounded-xl overflow-hidden neo-shadow-sm relative group">
      <img
        src={src}
        alt={alt || "Loyalty reward item"}
        loading="lazy"
        onError={() => setHasError(true)}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-xs text-white text-[9px] font-bold uppercase rounded border border-black">
        {category}
      </div>
    </div>
  );
}

export default function RewardsPage() {
  const { rewards, currentUser, claimReward } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [redeemModalReward, setRedeemModalReward] = useState(null);
  const [isClaiming, setIsClaiming] = useState(false);

  // Icon mapping
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Ticket': return Ticket;
      case 'Tag': return Tag;
      case 'Package': return Package;
      case 'ShieldCheck': return ShieldCheck;
      case 'Briefcase': return Briefcase;
      case 'CreditCard': return CreditCard;
      case 'Wrench': return Wrench;
      default: return Gift;
    }
  };

  const categories = ['All', 'Coupons', 'Physical Products', 'Safety Gear', 'Merchandise', 'Exclusive Gifts', 'Gift Cards'];

  const filteredRewards = selectedCategory === 'All'
    ? rewards
    : rewards.filter(r => r.category === selectedCategory);

  const handleOpenRedeemModal = (reward) => {
    if (currentUser.pointsBalance < reward.pointsRequired) {
      toast.error(`You need ${reward.pointsRequired - currentUser.pointsBalance} more points to claim this reward.`);
      return;
    }
    setRedeemModalReward(reward);
  };

  const handleConfirmRedeem = async () => {
    if (!redeemModalReward) return;
    setIsClaiming(true);

    try {
      const res = await claimReward(redeemModalReward.id || redeemModalReward._id);
      setIsClaiming(false);
      setRedeemModalReward(null);

      if (res?.success) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        toast.success(res.message, {
          style: { border: '2px solid black', borderRadius: '8px', fontWeight: 'bold' }
        });
      } else {
        toast.error(res?.message || 'Failed to claim reward.');
      }
    } catch (err) {
      setIsClaiming(false);
      setRedeemModalReward(null);
      toast.error(err.message || 'Reward redemption failed.');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-[#ffe17c] border-2 border-black rounded-2xl neo-shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 bg-dots">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-[#ffe17c] text-xs font-black uppercase rounded">
            <Gift className="w-3.5 h-3.5" />
            Rewards Marketplace
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-black">
            Redeem Your Hard-Earned Points
          </h1>
          <p className="text-xs sm:text-sm text-neutral-800 font-medium max-w-xl">
            Exchange your box code points for instant distributor discount vouchers, workshop tools, factory spares, and exclusive merchandise.
          </p>
        </div>

        {/* Current Balance Pill */}
        <div className="p-4 bg-white border-2 border-black rounded-xl neo-shadow flex items-center gap-4">
          <div className="w-12 h-12 bg-[#ffe17c] border-2 border-black rounded-xl flex items-center justify-center neo-shadow-sm">
            <Coins className="w-6 h-6 text-black" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block">
              Your Available Balance
            </span>
            <span className="font-heading font-black text-2xl text-black">
              {currentUser.pointsBalance.toLocaleString()} <span className="text-xs">PTS</span>
            </span>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-xs font-black uppercase text-neutral-500 flex items-center gap-1 flex-shrink-0 mr-1">
          <Filter className="w-3.5 h-3.5" /> Category:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border-2 border-black whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-black text-[#ffe17c] neo-shadow-sm font-black'
                : 'bg-white text-black hover:bg-neutral-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRewards.map((reward) => {
          const Icon = getIcon(reward.iconName);
          const canAfford = currentUser.pointsBalance >= reward.pointsRequired;
          const isOutOfStock = reward.availableQuantity <= 0;

          return (
            <div
              key={reward.id}
              className={`p-6 border-2 border-black rounded-2xl neo-shadow flex flex-col justify-between space-y-4 transition-all ${
                canAfford ? 'bg-white' : 'bg-neutral-50 opacity-90'
              }`}
            >
              <div className="space-y-3">
                {/* Top Badge & Points */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-[#f4f4f0] border border-black rounded text-black">
                    {reward.tag || reward.category}
                  </span>
                  <div className="flex items-center gap-1 px-2.5 py-0.5 bg-[#ffe17c] border border-black rounded font-heading font-black text-xs text-black">
                    <Coins className="w-3 h-3" />
                    <span>{reward.pointsRequired} PTS</span>
                  </div>
                </div>

                {/* Reward Visual Image */}
                <RewardCardImage
                  src={reward.image}
                  alt={reward.name}
                  category={reward.category}
                  icon={Icon}
                />

                {/* Title & Description */}
                <div>
                  <h3 className="font-heading font-black text-lg text-black leading-snug">
                    {reward.name}
                  </h3>
                  <p className="text-xs text-neutral-600 font-medium mt-1 line-clamp-2">
                    {reward.description}
                  </p>
                </div>
              </div>

              {/* Bottom: Stock & Redeem Action */}
              <div className="pt-2 border-t-2 border-black/10 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-neutral-500">
                  <span>Stock: {reward.availableQuantity} left</span>
                  <span>{reward.pointsRequired} Points</span>
                </div>

                <button
                  type="button"
                  disabled={!canAfford || isOutOfStock}
                  onClick={() => handleOpenRedeemModal(reward)}
                  className={`w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 border-2 border-black transition-all ${
                    canAfford && !isOutOfStock
                      ? 'bg-[#ffe17c] text-black neo-btn'
                      : 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  {isOutOfStock ? (
                    'Out of Stock'
                  ) : canAfford ? (
                    <>
                      <span>Redeem Reward</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    `Need ${reward.pointsRequired - currentUser.pointsBalance} more pts`
                  )}
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Redemption Confirmation Modal */}
      <Modal
        isOpen={!!redeemModalReward}
        onClose={() => setRedeemModalReward(null)}
        title="Confirm Reward Redemption"
      >
        {redeemModalReward && (
          <div className="space-y-5">
            {redeemModalReward.image && (
              <div className="h-32 w-full bg-neutral-100 border-2 border-black rounded-xl overflow-hidden neo-shadow-sm">
                <img
                  src={redeemModalReward.image}
                  alt={redeemModalReward.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-4 bg-[#fbfaf5] border-2 border-black rounded-xl space-y-2 text-center">
              <span className="text-[10px] font-black uppercase bg-[#ffe17c] px-2 py-0.5 border border-black rounded">
                {redeemModalReward.category}
              </span>
              <h4 className="font-heading font-black text-2xl text-black">
                {redeemModalReward.name}
              </h4>
              <p className="text-xs text-neutral-600 font-medium">
                {redeemModalReward.description}
              </p>
            </div>

            {/* Point Calculation breakdown */}
            <div className="p-4 bg-white border-2 border-black rounded-xl space-y-2 text-xs font-semibold">
              <div className="flex justify-between">
                <span className="text-neutral-600">Current Points Balance:</span>
                <span className="font-black text-black">{currentUser.pointsBalance.toLocaleString()} PTS</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Reward Deduction:</span>
                <span className="font-black">-{redeemModalReward.pointsRequired} PTS</span>
              </div>
              <div className="flex justify-between border-t-2 border-black/10 pt-2 font-black text-sm text-black">
                <span>Balance After Claim:</span>
                <span className="text-emerald-700">
                  {(currentUser.pointsBalance - redeemModalReward.pointsRequired).toLocaleString()} PTS
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-black rounded-lg text-xs text-amber-900 font-medium">
              ℹ️ Digital coupon codes are delivered instantly to your registered email <strong>{currentUser.email}</strong>. Physical items ship within 48 hours.
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRedeemModalReward(null)}
                className="w-1/2 py-3 bg-white text-black neo-btn rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isClaiming}
                onClick={handleConfirmRedeem}
                className="w-1/2 py-3 bg-black text-[#ffe17c] neo-btn rounded-xl text-xs font-black flex items-center justify-center gap-1.5"
              >
                {isClaiming ? 'Processing...' : 'Confirm & Claim'}
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
