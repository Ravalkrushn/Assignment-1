import React, { useState } from 'react';
import { 
  UserCircle, 
  ShieldCheck, 
  Save, 
  Key, 
  Coins, 
  CheckCircle2,
  Edit3
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

export default function CustomerProfilePage() {
  const { currentUser, updateProfile } = useApp();

  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone,
    businessName: currentUser.businessName,
    city: currentUser.city,
    state: currentUser.state
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData);
    setIsEditing(false);
    toast.success('Customer profile details updated successfully!');
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error('Please enter both current and new password.');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error('New passwords do not match!');
      return;
    }
    toast.success('Security password successfully updated!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 bg-[#ffe17c] border-2 border-black rounded-2xl neo-shadow-lg flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-dots">
        <div className="w-20 h-20 bg-black text-[#ffe17c] border-2 border-black rounded-2xl flex items-center justify-center font-heading font-black text-3xl neo-shadow-sm flex-shrink-0">
          {currentUser.name.charAt(0)}
        </div>

        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-black text-[#ffe17c] text-xs font-black uppercase rounded">
            {currentUser.tier}
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-black">
            {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-800 font-medium">
            {currentUser.businessName} • Member since March 2026
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs font-bold text-neutral-800">
            <span className="flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-black" /> {currentUser.pointsBalance.toLocaleString()} Available Points
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> {currentUser.boxesRedeemed} Boxes Verified
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-white text-black neo-btn rounded-xl text-xs font-bold flex items-center gap-1.5 self-center sm:self-start"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left: Profile Details Form (7 cols) */}
        <div className="md:col-span-7 bg-white border-2 border-black rounded-2xl neo-shadow-lg p-6 sm:p-8 space-y-6">
          <div className="border-b-2 border-black/10 pb-4">
            <h3 className="font-heading font-extrabold text-xl text-black flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-black" />
              Customer Information
            </h3>
            <p className="text-xs text-neutral-500 font-medium">
              Registered business profile for physical warranty and rewards shipment.
            </p>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider text-black">
                Full Name
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-white neo-input rounded-xl text-black font-medium disabled:bg-neutral-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider text-black">
                Email Address
              </label>
              <input
                type="email"
                disabled={!isEditing}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-white neo-input rounded-xl text-black font-medium disabled:bg-neutral-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider text-black">
                Mobile Number
              </label>
              <input
                type="tel"
                disabled={!isEditing}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-white neo-input rounded-xl text-black font-medium disabled:bg-neutral-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider text-black">
                Workshop / Company Name
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-white neo-input rounded-xl text-black font-medium disabled:bg-neutral-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-black uppercase tracking-wider text-black">
                  City
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white neo-input rounded-xl text-black font-medium disabled:bg-neutral-100 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black uppercase tracking-wider text-black">
                  State
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white neo-input rounded-xl text-black font-medium disabled:bg-neutral-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {isEditing && (
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#ffe17c] text-black neo-btn rounded-xl font-heading font-black text-sm flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile Updates</span>
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Right: Security & Password (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          
          {/* Change Password Card */}
          <div className="bg-white border-2 border-black rounded-2xl neo-shadow-lg p-6 space-y-5">
            <div className="border-b-2 border-black/10 pb-3">
              <h3 className="font-heading font-extrabold text-lg text-black flex items-center gap-2">
                <Key className="w-4 h-4 text-black" />
                Change Password
              </h3>
              <p className="text-xs text-neutral-500 font-medium">
                Update account access credentials.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-black uppercase tracking-wider text-black">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs bg-white neo-input rounded-xl text-black font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black uppercase tracking-wider text-black">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs bg-white neo-input rounded-xl text-black font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black uppercase tracking-wider text-black">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.confirmNewPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs bg-white neo-input rounded-xl text-black font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-black text-white neo-btn rounded-xl text-xs font-bold"
              >
                Update Password
              </button>
            </form>
          </div>

          {/* Account Security Badge */}
          <div className="p-4 bg-emerald-50 border-2 border-black rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified Authenticity Badge
            </div>
            <p className="text-xs text-neutral-600 font-medium leading-relaxed">
              Your registered mobile number <strong>{currentUser.phone}</strong> is verified for instant reward dispatch SMS confirmations.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
