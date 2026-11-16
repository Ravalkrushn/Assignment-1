import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error('Reset token is missing or invalid. Please request a new link.');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.auth.resetPassword({ token, password });
      setIsLoading(false);
      setIsSuccess(true);
      toast.success(res?.message || 'Password updated successfully! You may now sign in.');
    } catch (err) {
      setIsLoading(false);
      toast.error(err?.message || 'Failed to reset password. The link may have expired.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 sm:p-8 bg-[#fbfaf5]">
      <div className="max-w-md w-full bg-white neo-card-lg rounded-2xl overflow-hidden p-8 sm:p-10 space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#ffe17c] border-2 border-black rounded-xl flex items-center justify-center mx-auto neo-shadow-sm">
            <Lock className="w-6 h-6 text-black" />
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-black">
            Set New Password
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 font-medium">
            Create a strong, secure password of at least 8 characters for your account.
          </p>
        </div>

        {!token ? (
          <div className="p-5 bg-amber-50 border-2 border-black rounded-xl text-center space-y-3">
            <p className="text-xs text-amber-900 font-bold">
              ⚠️ Invalid or missing password reset token in the link URL.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-[#ffe17c] neo-btn rounded-xl text-xs font-bold"
            >
              Request New Reset Link
            </Link>
          </div>
        ) : isSuccess ? (
          <div className="p-6 bg-emerald-50 border-2 border-black rounded-xl space-y-4 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-heading font-bold text-lg text-black">Password Changed!</h4>
            <p className="text-xs text-neutral-700 leading-relaxed font-medium">
              Your password has been updated. You can now log in using your new credentials.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-2.5 bg-black text-[#ffe17c] neo-btn rounded-xl text-xs font-black flex items-center justify-center gap-1.5"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-black">
                New Password (Min. 8 characters)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 text-sm bg-white neo-input rounded-xl text-black font-medium pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-neutral-500 hover:text-black"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-black">
                Confirm New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 text-sm bg-white neo-input rounded-xl text-black font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#ffe17c] text-black neo-btn rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-[#fed954] mt-2"
            >
              {isLoading ? (
                <span>Updating Password...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="pt-2 text-center">
          <Link to="/login" className="text-xs text-neutral-600 font-bold hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
