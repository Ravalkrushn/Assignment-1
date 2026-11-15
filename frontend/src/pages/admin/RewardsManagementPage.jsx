import React, { useState } from 'react';
import { 
  Gift, 
  Plus, 
  Search, 
  Edit3, 
  Trash2,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const REWARD_IMAGE_PRESETS = [
  { label: '₹50 Coupon', url: '/rewards/coupon-50.jpg' },
  { label: '₹100 Rebate', url: '/rewards/coupon-100.jpg' },
  { label: 'Hydraulic Spares', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80' },
  { label: 'Safety Gear', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=80' },
  { label: 'Tool Bag', url: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=500&auto=format&fit=crop&q=80' },
  { label: 'Gift Box', url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=80' }
];

export default function RewardsManagementPage() {
  const { rewards, addReward, updateReward, deleteReward } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [deletingRewardId, setDeletingRewardId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    pointsRequired: 100,
    category: 'Coupons',
    availableQuantity: 50,
    status: 'Active',
    description: '',
    tag: 'Popular',
    iconName: 'Gift',
    image: ''
  });

  const categories = [
    'Coupons',
    'Physical Products',
    'Safety Gear',
    'Merchandise',
    'Exclusive Gifts',
    'Gift Cards',
    'Services'
  ];

  const filteredRewards = rewards.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      pointsRequired: 100,
      category: 'Coupons',
      availableQuantity: 50,
      status: 'Active',
      description: '',
      tag: 'New Addition',
      iconName: 'Gift',
      image: '/rewards/coupon-50.jpg'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (r) => {
    setEditingReward(r);
    setFormData({
      name: r.name,
      pointsRequired: r.pointsRequired,
      category: r.category,
      availableQuantity: r.availableQuantity,
      status: r.status,
      description: r.description || '',
      tag: r.tag || '',
      iconName: r.iconName || 'Gift',
      image: r.image || ''
    });
  };

  const handleSaveReward = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Please enter reward name.');
      return;
    }

    try {
      if (editingReward) {
        await updateReward(editingReward.id || editingReward._id, formData);
        toast.success(`Updated "${formData.name}" successfully!`);
        setEditingReward(null);
      } else {
        await addReward(formData);
        toast.success(`Added new reward "${formData.name}"!`);
        setIsAddModalOpen(false);
      }
    } catch {
      toast.error('Failed to save reward.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingRewardId) return;
    try {
      await deleteReward(deletingRewardId);
      toast.success('Reward deleted from active catalog.');
    } catch {
      toast.error('Failed to delete reward.');
    }
    setDeletingRewardId(null);
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-[#ffe17c] border-2 border-black rounded-2xl neo-shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 bg-dots">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-[#ffe17c] text-xs font-black uppercase rounded">
            <Gift className="w-3.5 h-3.5" />
            Loyalty Incentive Program
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-black">
            Rewards Catalog Management
          </h1>
          <p className="text-xs sm:text-sm text-neutral-800 font-medium max-w-xl">
            Create and edit redemption offerings, assign required points costs, update inventory allocations, and monitor stock levels.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-3 bg-black text-[#ffe17c] neo-btn rounded-xl font-heading font-bold text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Reward</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="p-5 bg-white border-2 border-black rounded-2xl neo-shadow flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search rewards by name or category..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white neo-input rounded-xl text-black font-medium"
          />
        </div>

        <span className="text-xs font-bold text-neutral-500 hidden sm:block">
          {filteredRewards.length} rewards in catalog
        </span>
      </div>

      {/* Rewards Table */}
      <div className="bg-white border-2 border-black rounded-2xl neo-shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b-2 border-black bg-[#fbfaf5] text-neutral-600 font-black uppercase text-xs">
                <th className="py-3 px-4">Reward ID</th>
                <th className="py-3 px-4">Reward Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Points Required</th>
                <th className="py-3 px-4">Available Inventory</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 font-medium">
              {filteredRewards.map((r) => (
                <tr key={r.id} className="hover:bg-[#fbfaf5] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-black">{r.id}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      {r.image ? (
                        <img 
                          src={r.image} 
                          alt={r.name} 
                          className="w-10 h-10 object-cover rounded-lg border border-black shrink-0" 
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-[#ffe17c] rounded-lg border border-black flex items-center justify-center shrink-0">
                          <Gift className="w-5 h-5 text-black" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-black">{r.name}</p>
                        <p className="text-[11px] text-neutral-500 truncate max-w-xs">{r.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 bg-[#f4f4f0] border border-black rounded text-[11px] font-bold">
                      {r.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 bg-[#ffe17c] text-black border border-black rounded font-black text-xs">
                      {r.pointsRequired} PTS
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-black">
                    {r.availableQuantity} Units
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-black uppercase border border-black rounded ${
                      r.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-700'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(r)}
                        className="p-1.5 bg-white neo-btn rounded-lg text-black hover:bg-[#ffe17c]"
                        title="Edit Reward"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingRewardId(r.id)}
                        className="p-1.5 bg-white neo-btn rounded-lg text-red-600 hover:bg-red-50"
                        title="Delete Reward"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Reward Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingReward}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingReward(null);
        }}
        title={editingReward ? "Edit Reward Offering" : "Add New Reward to Catalog"}
      >
        <form onSubmit={handleSaveReward} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-black uppercase tracking-wider text-black">
              Reward Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. ₹200 Factory Discount Coupon"
              className="w-full px-3 py-2 text-xs bg-white neo-input rounded-xl text-black font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider text-black">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white neo-input rounded-xl text-black font-medium"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider text-black">
                Points Required
              </label>
              <input
                type="number"
                required
                min="10"
                step="10"
                value={formData.pointsRequired}
                onChange={(e) => setFormData({ ...formData, pointsRequired: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-white neo-input rounded-xl text-black font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider text-black">
                Available Stock Quantity
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.availableQuantity}
                onChange={(e) => setFormData({ ...formData, availableQuantity: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-white neo-input rounded-xl text-black font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider text-black">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white neo-input rounded-xl text-black font-medium"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-black uppercase tracking-wider text-black">
              Reward Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Terms, redemption instructions, or delivery guidelines..."
              className="w-full px-3 py-2 text-xs bg-white neo-input rounded-xl text-black font-medium"
            />
          </div>

          {/* Reward Image Selection & Preview */}
          <div className="space-y-2 p-3.5 bg-[#fbfaf5] border-2 border-black rounded-xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                Reward Image (Photo or Graphic)
              </label>
              {formData.image && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, image: '' })}
                  className="text-[10px] font-bold text-red-600 hover:underline flex items-center gap-0.5"
                >
                  <X className="w-3 h-3" /> Clear Image
                </button>
              )}
            </div>

            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="Enter Image URL (e.g. https://... or /rewards/coupon-50.jpg)"
              className="w-full px-3 py-2 text-xs bg-white neo-input rounded-xl text-black font-medium"
            />

            {/* Quick Pick Presets */}
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block">
                ⚡ Quick Pick Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {REWARD_IMAGE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setFormData({ ...formData, image: preset.url })}
                    className={`px-2 py-1 text-[11px] rounded-lg border border-black font-bold transition-all ${
                      formData.image === preset.url
                        ? 'bg-black text-[#ffe17c]'
                        : 'bg-white text-black hover:bg-[#ffe17c]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Image Preview */}
            {formData.image ? (
              <div className="relative mt-2 border-2 border-black rounded-xl overflow-hidden h-28 bg-neutral-100 flex items-center justify-center">
                <img
                  src={formData.image}
                  alt="Reward preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <span className="absolute bottom-1 right-2 px-1.5 py-0.5 bg-black/75 text-white text-[9px] font-black uppercase rounded">
                  Live Preview
                </span>
              </div>
            ) : (
              <p className="text-[10px] text-neutral-500 font-medium italic">
                No image specified. Default category icon/photo will be used.
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingReward(null);
              }}
              className="w-1/2 py-2.5 bg-white text-black neo-btn rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 bg-[#ffe17c] text-black neo-btn rounded-xl text-xs font-black"
            >
              {editingReward ? 'Save Changes' : 'Create Reward'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingRewardId}
        onClose={() => setDeletingRewardId(null)}
        title="Confirm Reward Removal"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-neutral-700 leading-relaxed font-medium">
            Are you sure you want to delete this reward from the marketplace? Existing claimed transactions will remain in audit logs.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setDeletingRewardId(null)}
              className="w-1/2 py-2.5 bg-white text-black neo-btn rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="w-1/2 py-2.5 bg-red-600 text-white neo-btn rounded-xl text-xs font-black hover:bg-red-700"
            >
              Delete Reward
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
