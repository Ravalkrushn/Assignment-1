import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Eye, EyeOff, Lock, Mail, User, Phone, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRegister = (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (!formData.acceptTerms) {
      toast.error('Please accept the Terms & Conditions.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Registration successful! Welcome to LOYALTYBOX.');
      navigate('/customer/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 sm:p-8 bg-[#fbfaf5]">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 bg-white neo-card-lg rounded-2xl overflow-hidden">
        
        {/* Left: Info panel */}
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

            <div className="space-y-3 pt-4">
              <span className="text-[10px] font-black uppercase tracking-wider bg-black text-[#ffe17c] px-2.5 py-1 rounded">
                Free Registration
              </span>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-black">
                Unlock 100 Bonus Points On Signup
              </h2>
              <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-medium">
                Register as a verified customer or workshop owner to start scanning box codes and claiming high-value rewards.
              </p>
            </div>

            <div className="p-4 bg-white/70 border-2 border-black rounded-xl space-y-2 text-xs font-bold text-black">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-700" /> Instant activation
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-700" /> Tamper-proof product verification
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-700" /> Cash rebate coupons on factory spares
              </div>
            </div>
          </div>

          <div className="pt-6 border-t-2 border-black/20">
            <p className="text-xs font-bold text-neutral-900">
              Already registered?{' '}
              <Link to="/login" className="underline font-black">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Right: Registration Form */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full space-y-5">
            <div>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-black">
                Create Account
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-medium mt-1">
                Enter your details to register as a loyalty member.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-3.5">
              
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-black uppercase tracking-wider text-black">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-10 pr-4 py-2 text-sm bg-white neo-input rounded-xl text-black font-medium"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="block text-xs font-black uppercase tracking-wider text-black">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="rahul@workshop.in"
                    className="w-full pl-10 pr-4 py-2 text-sm bg-white neo-input rounded-xl text-black font-medium"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="space-y-1">
                <label className="block text-xs font-black uppercase tracking-wider text-black">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2 text-sm bg-white neo-input rounded-xl text-black font-medium"
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-black uppercase tracking-wider text-black">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-8 py-2 text-sm bg-white neo-input rounded-xl text-black font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-3 text-neutral-500 hover:text-black"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-black uppercase tracking-wider text-black">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-4 py-2 text-sm bg-white neo-input rounded-xl text-black font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="w-4 h-4 border-2 border-black rounded cursor-pointer accent-[#ffe17c] mt-0.5"
                />
                <label htmlFor="acceptTerms" className="text-xs font-medium text-neutral-700 cursor-pointer">
                  I agree to the <span className="font-bold underline text-black">Rewards Program Terms</span> & verify that I purchase genuine factory boxed goods.
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#ffe17c] text-black neo-btn rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
