import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Plus, 
  Calendar, 
  Sparkles, 
  Tag, 
  Layers, 
  CheckCircle2, 
  Clock, 
  PauseCircle, 
  Trash2, 
  RefreshCw,
  Gift
} from 'lucide-react';
import { api } from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export default function CampaignManagementPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Double Points',
    pointsMultiplier: 2,
    bonusPoints: 0,
    eligibleProducts: '',
    startDate: '',
    endDate: '',
    bannerText: '',
    maxRedemptions: '',
    maxRedemptionsPerUser: 1,
    status: 'Active'
  });

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await api.campaigns.getAll();
      if (res?.success && Array.isArray(res?.data?.campaigns)) {
        setCampaigns(res.data.campaigns);
      }
    } catch (err) {
      toast.error('Failed to load marketing campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.startDate || !formData.endDate) {
      toast.error('Title, start date, and end date are required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        pointsMultiplier: Number(formData.pointsMultiplier) || 1,
        bonusPoints: Number(formData.bonusPoints) || 0,
        eligibleProducts: formData.eligibleProducts ? formData.eligibleProducts.split(',').map(s => s.trim().toUpperCase()) : [],
        maxRedemptions: formData.maxRedemptions ? Number(formData.maxRedemptions) : null,
        maxRedemptionsPerUser: Number(formData.maxRedemptionsPerUser) || 1
      };

      const res = await api.campaigns.create(payload);
      if (res?.success) {
        toast.success('Campaign created successfully!');
        setIsCreateModalOpen(false);
        setFormData({
          title: '',
          description: '',
          type: 'Double Points',
          pointsMultiplier: 2,
          bonusPoints: 0,
          eligibleProducts: '',
          startDate: '',
          endDate: '',
          bannerText: '',
          maxRedemptions: '',
          maxRedemptionsPerUser: 1,
          status: 'Active'
        });
        fetchCampaigns();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create campaign');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await api.campaigns.update(id, { status: newStatus });
      if (res?.success) {
        toast.success(`Campaign status set to ${newStatus}`);
        setCampaigns(prev => prev.map(c => (c._id === id || c.id === id) ? { ...c, status: newStatus } : c));
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this campaign?')) return;
    try {
      const res = await api.campaigns.delete(id);
      if (res?.success) {
        toast.success('Campaign removed');
        setCampaigns(prev => prev.map(c => (c._id === id || c.id === id) ? { ...c, status: 'Cancelled' } : c));
        fetchCampaigns();
      }
    } catch (err) {
      toast.error('Failed to delete campaign');
    }
  };

  const filteredCampaigns = campaigns.filter(c => {
    if (filterStatus === 'ALL') return true;
    return c.status === filterStatus;
  });

  const activeCount = campaigns.filter(c => c.status === 'Active').length;
  const totalBonusPoints = campaigns.reduce((acc, curr) => acc + (curr.totalBonusAwarded || 0), 0);
  const totalRedemptions = campaigns.reduce((acc, curr) => acc + (curr.redemptionsCount || 0), 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <span className="px-2 py-0.5 bg-emerald-400 text-black font-black text-xs rounded border border-black shadow-[1px_1px_0px_0px_#000]">Active</span>;
      case 'Paused':
        return <span className="px-2 py-0.5 bg-amber-300 text-black font-black text-xs rounded border border-black shadow-[1px_1px_0px_0px_#000]">Paused</span>;
      case 'Completed':
        return <span className="px-2 py-0.5 bg-neutral-200 text-neutral-800 font-bold text-xs rounded border border-black">Completed</span>;
      default:
        return <span className="px-2 py-0.5 bg-neutral-100 text-black font-bold text-xs rounded border border-black">{status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-[#171e19] text-white border-2 border-black rounded-2xl neo-shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ffe17c] text-black text-xs font-black uppercase rounded neo-shadow-sm border border-black">
            <Sparkles className="w-3.5 h-3.5" />
            Promotional Engine
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-white">
            Reward Campaigns
          </h1>
          <p className="text-xs sm:text-sm text-[#b7c6c2] font-medium max-w-xl">
            Design and launch dynamic loyalty multipliers, bonus festival promotions, and SKU-targeted boost campaigns with real-time automatic point crediting.
          </p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={fetchCampaigns}
            disabled={loading}
            className="p-3 bg-white text-black border-2 border-black rounded-xl neo-btn flex items-center gap-2 text-xs font-bold"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-3 bg-[#ffe17c] text-black border-2 border-black rounded-xl neo-btn flex items-center gap-2 font-black text-xs uppercase"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Campaign</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border-2 border-black rounded-xl neo-shadow">
          <span className="text-xs font-bold text-neutral-500 uppercase block">Total Campaigns</span>
          <p className="text-2xl font-black mt-1 text-black">{campaigns.length}</p>
          <span className="text-[11px] text-neutral-500">Configured promotional offers</span>
        </div>
        <div className="p-4 bg-emerald-50 border-2 border-black rounded-xl neo-shadow">
          <span className="text-xs font-bold text-emerald-800 uppercase block">Active Campaigns</span>
          <p className="text-2xl font-black mt-1 text-emerald-800">{activeCount}</p>
          <span className="text-[11px] text-emerald-600">Currently awarding extra points</span>
        </div>
        <div className="p-4 bg-white border-2 border-black rounded-xl neo-shadow">
          <span className="text-xs font-bold text-neutral-500 uppercase block">Redemptions Driven</span>
          <p className="text-2xl font-black mt-1 text-black">{totalRedemptions}</p>
          <span className="text-[11px] text-neutral-500">Codes scanned under campaigns</span>
        </div>
        <div className="p-4 bg-[#ffe17c]/30 border-2 border-black rounded-xl neo-shadow">
          <span className="text-xs font-bold text-neutral-800 uppercase block">Bonus Points Issued</span>
          <p className="text-2xl font-black mt-1 text-black">+{totalBonusPoints.toLocaleString()} <span className="text-xs font-bold">PTS</span></p>
          <span className="text-[11px] text-neutral-600">Extra rewards credited to users</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['ALL', 'Active', 'Paused', 'Completed'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 text-xs font-black border-2 border-black rounded-xl transition-all ${
              filterStatus === s ? 'bg-[#ffe17c] neo-shadow-sm' : 'bg-white'
            }`}
          >
            {s === 'ALL' ? 'All Campaigns' : s}
          </button>
        ))}
      </div>

      {/* Campaigns Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCampaigns.length === 0 ? (
          <div className="col-span-full p-12 bg-white border-2 border-black rounded-2xl text-center space-y-3 neo-shadow">
            <Gift className="w-12 h-12 mx-auto text-neutral-400" />
            <h3 className="font-heading font-black text-xl text-black">No Campaigns Found</h3>
            <p className="text-xs text-neutral-600 max-w-sm mx-auto">
              Create your first promotional campaign to boost customer scan velocity and award bonus loyalty points.
            </p>
          </div>
        ) : (
          filteredCampaigns.map((camp) => {
            const cid = camp._id || camp.id;
            return (
              <div 
                key={cid}
                className="bg-white border-2 border-black rounded-2xl neo-shadow-lg p-5 flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                {/* Banner Strip if provided */}
                {camp.bannerText && (
                  <div className="bg-[#171e19] text-[#ffe17c] font-black text-[10px] uppercase py-1 px-3 -mx-5 -mt-5 mb-2 border-b-2 border-black flex items-center justify-between">
                    <span>{camp.bannerText}</span>
                    <Flame className="w-3 h-3 text-[#ffe17c]" />
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-neutral-100 font-mono font-black text-[10px] border border-black rounded">
                      {camp.type}
                    </span>
                    {getStatusBadge(camp.status)}
                  </div>

                  <div>
                    <h3 className="font-heading font-black text-xl text-black leading-tight">
                      {camp.title}
                    </h3>
                    <p className="text-xs text-neutral-600 mt-1 line-clamp-2">
                      {camp.description || 'Exclusive loyalty reward campaign active during selected event period.'}
                    </p>
                  </div>

                  {/* Benefit Callout */}
                  <div className="p-3 bg-[#ffe17c]/20 border-2 border-black rounded-xl flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-800">Reward Boost:</span>
                    <span className="font-black text-base text-black font-mono">
                      {camp.pointsMultiplier > 1 ? `${camp.pointsMultiplier}x Multiplier` : ''}
                      {camp.pointsMultiplier > 1 && camp.bonusPoints > 0 ? ' + ' : ''}
                      {camp.bonusPoints > 0 ? `+${camp.bonusPoints} Pts` : ''}
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1 text-xs text-neutral-700">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{new Date(camp.startDate).toLocaleDateString()} &rarr; {new Date(camp.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Eligible: {camp.eligibleProducts?.length > 0 ? camp.eligibleProducts.join(', ') : 'All Products'}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-black/10 text-[11px] text-neutral-600">
                      <span>Redemptions: <strong>{camp.redemptionsCount || 0}</strong></span>
                      <span>Total Bonus: <strong>+{camp.totalBonusAwarded || 0} pts</strong></span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t-2 border-black/10 flex items-center justify-between gap-2">
                  <select
                    value={camp.status}
                    onChange={(e) => handleStatusChange(cid, e.target.value)}
                    className="px-2 py-1 text-xs font-bold bg-white border border-black rounded shadow-[2px_2px_0px_0px_#000]"
                  >
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                    <option value="Completed">Completed</option>
                  </select>

                  <button
                    onClick={() => handleDeleteCampaign(cid)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded border border-black neo-shadow-sm"
                    title="Delete Campaign"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Campaign Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Promotional Campaign"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
          
          <div>
            <label className="block font-bold text-black mb-1">Campaign Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Diwali Double Points Bonanza"
              className="w-full px-3 py-2 bg-white neo-input rounded-xl border-2 border-black font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-black mb-1">Description</label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the promotional campaign requirements..."
              className="w-full px-3 py-2 bg-white neo-input rounded-xl border-2 border-black font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-black mb-1">Campaign Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 bg-white border-2 border-black rounded-xl font-bold"
              >
                <option value="Double Points">Double Points</option>
                <option value="Bonus Points">Bonus Points</option>
                <option value="Festival Campaign">Festival Campaign</option>
                <option value="Limited-Time Campaign">Limited-Time Campaign</option>
                <option value="New Customer Campaign">New Customer Campaign</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-black mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-white border-2 border-black rounded-xl font-bold"
              >
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-black mb-1">Points Multiplier (e.g. 2 for 2x)</label>
              <input
                type="number"
                step="0.5"
                min="1"
                value={formData.pointsMultiplier}
                onChange={(e) => setFormData({ ...formData, pointsMultiplier: e.target.value })}
                className="w-full px-3 py-2 bg-white neo-input rounded-xl border-2 border-black font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-black mb-1">Flat Bonus Points (optional)</label>
              <input
                type="number"
                min="0"
                value={formData.bonusPoints}
                onChange={(e) => setFormData({ ...formData, bonusPoints: e.target.value })}
                className="w-full px-3 py-2 bg-white neo-input rounded-xl border-2 border-black font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-black mb-1">Start Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-white neo-input rounded-xl border-2 border-black font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-black mb-1">End Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 bg-white neo-input rounded-xl border-2 border-black font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-black mb-1">Eligible Product SKUs (comma-separated, leave blank for all)</label>
            <input
              type="text"
              value={formData.eligibleProducts}
              onChange={(e) => setFormData({ ...formData, eligibleProducts: e.target.value })}
              placeholder="e.g. PROD-PREM-001, PROD-GOLD-002"
              className="w-full px-3 py-2 bg-white neo-input rounded-xl border-2 border-black font-medium font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-black mb-1">Banner Announcement Text (shown on customer dashboard)</label>
            <input
              type="text"
              value={formData.bannerText}
              onChange={(e) => setFormData({ ...formData, bannerText: e.target.value })}
              placeholder="e.g. 🌟 SPECIAL DIWALI 2X POINTS ACTIVE NOW!"
              className="w-full px-3 py-2 bg-white neo-input rounded-xl border-2 border-black font-medium"
            />
          </div>

          <div className="pt-3 border-t-2 border-black/10 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 bg-neutral-100 text-neutral-800 border-2 border-black rounded-xl font-bold neo-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-[#ffe17c] text-black border-2 border-black rounded-xl font-black neo-btn"
            >
              {submitting ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
