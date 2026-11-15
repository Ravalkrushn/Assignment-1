import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('rahul.sharma@workshop.in');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { loginUser } = useApp();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginUser(email, password);
      setIsLoading(false);
      const user = res?.user;
      if (user?.role === 'admin') {
        toast.success(`Welcome to Factory Admin Portal, ${user.name}!`);
        navigate('/admin/dashboard');
      } else {
        toast.success(`Welcome back, ${user?.name || 'Customer'}!`);
        navigate('/customer/dashboard');
      }
    } catch (err) {
      setIsLoading(false);
      toast.error(err.message || 'Login failed. Please verify credentials.');
    }
  };

  const handleDemoCustomerLogin = async () => {
    setEmail('rahul.sharma@workshop.in');
    setPassword('password123');
    setIsLoading(true);
    try {
      const res = await loginUser('rahul.sharma@workshop.in', 'password123');
      setIsLoading(false);
      toast.success('Logged in as Rahul Sharma (Verified Customer)');
      navigate('/customer/dashboard');
    } catch (err) {
      setIsLoading(false);
      toast.error(err.message || 'Customer login failed.');
    }
  };

  const handleDemoAdminLogin = async () => {
    setEmail('admin@factory.io');
    setPassword('AdminSecurePassword123!');
    setIsLoading(true);
    try {
      const res = await loginUser('admin@factory.io', 'AdminSecurePassword123!');
      setIsLoading(false);
      toast.success('Logged in as Harish Patel (Factory Owner)');
      navigate('/admin/dashboard');
    } catch (err) {
      setIsLoading(false);
      toast.error(err.message || 'Admin login failed.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 sm:p-8 bg-[#fbfaf5]">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 bg-white neo-card-lg rounded-2xl overflow-hidden">
        
        {/* Left: Yellow Branded Promotional Panel */}
        <div className="md:col-span-5 bg-[#ffe17c] p-8 sm:p-10 border-b-2 md:border-b-0 md:border-r-2 border-black flex flex-col justify-between bg-dots">
          <div className="space-y-6">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 bg-black flex items-center justify-center neo-shadow-sm">
                <Sparkles className="w-6 h-6 text-[#ffe17c]" />
              </div>
              <span className="font-heading font-extrabold text-2xl tracking-tight text-black">
                LOYALTY<span className="bg-black text-[#ffe17c] px-1 ml-0.5">BOX</span>
              </span>
            </Link>

            <div className="space-y-2 pt-4">
              <span className="text-[10px] font-black uppercase tracking-wider bg-black text-[#ffe17c] px-2.5 py-1 rounded">
                Member Access
              </span>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-black">
                Turn Every Product Box Into Points.
              </h2>
              <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-medium">
                Log in to check points balance, redeem genuine factory codes, and claim tools, cash coupons, or exclusive gifts.
              </p>
            </div>

            {/* Factory Verification Visual Card */}
            <div className="relative border-2 border-black rounded-xl overflow-hidden neo-shadow-sm bg-black group">
              <img 
                src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80" 
                alt="Factory box digital verification" 
                loading="lazy"
                className="w-full h-24 object-cover opacity-85 group-hover:opacity-95 transition-opacity"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex items-end p-2.5">
                <div className="flex items-center gap-1.5 text-white">
                  <ShieldCheck className="w-4 h-4 text-[#ffe17c] shrink-0" />
                  <span className="text-[11px] font-black tracking-tight leading-tight">
                    100% Genuine Factory Box Verification
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick 1-Click Evaluation Logins */}
          <div className="pt-8 border-t-2 border-black/20 space-y-2.5">
            <p className="text-[11px] font-black uppercase tracking-wider text-black">
              ⚡ Instant Demo Credentials:
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={handleDemoCustomerLogin}
                className="w-full py-2 px-3 bg-black text-white neo-btn rounded-lg text-xs font-bold flex items-center justify-between"
              >
                <span>Demo Customer (Rahul)</span>
                <UserCheck className="w-4 h-4 text-[#ffe17c]" />
              </button>
              <button
                type="button"
                onClick={handleDemoAdminLogin}
                className="w-full py-2 px-3 bg-[#171e19] text-[#ffe17c] neo-btn rounded-lg text-xs font-bold flex items-center justify-between"
              >
                <span>Demo Admin (Factory Owner)</span>
                <ShieldCheck className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Right: Login Form */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full space-y-6">
            <div>
              <h2 className="font-heading font-extrabold text-3xl text-black">
                Sign In
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-medium mt-1">
                Enter your registered details to access your account.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-black">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@workshop.in"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white neo-input rounded-xl text-black font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black uppercase tracking-wider text-black">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-bold text-neutral-700 hover:text-black underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-white neo-input rounded-xl text-black font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-neutral-500 hover:text-black"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 border-2 border-black rounded cursor-pointer accent-[#ffe17c]"
                />
                <label htmlFor="remember" className="text-xs font-semibold text-neutral-700 cursor-pointer select-none">
                  Keep me logged in for 30 days
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 space-y-2.5">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-[#ffe17c] text-black neo-btn rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Create Account Link */}
            <div className="pt-4 text-center border-t-2 border-black/10">
              <p className="text-xs text-neutral-600 font-medium">
                Don't have an account yet?{' '}
                <Link to="/register" className="font-black text-black hover:underline">
                  Create Account
                </Link>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
