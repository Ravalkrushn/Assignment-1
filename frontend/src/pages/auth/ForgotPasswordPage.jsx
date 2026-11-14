import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your registered email address.');
      return;
    }

    setIsLoading(true);
    try {
      await api.auth.forgotPassword(email);
    } catch {
      // Graceful handling even if offline or user not found
    }
    setIsLoading(false);
    setIsSubmitted(true);
    toast.success('Password reset instructions sent to your inbox!');
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 sm:p-8 bg-[#fbfaf5]">
      <div className="max-w-md w-full bg-white neo-card-lg rounded-2xl overflow-hidden p-8 sm:p-10 space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#ffe17c] border-2 border-black rounded-xl flex items-center justify-center mx-auto neo-shadow-sm">
            <Mail className="w-6 h-6 text-black" />
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-black">
            Reset Password
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 font-medium">
            Enter your email address and we'll send you a secure verification link to reset your account password.
          </p>
        </div>

        {isSubmitted ? (
          <div className="p-6 bg-emerald-50 border-2 border-black rounded-xl space-y-4 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-heading font-bold text-lg text-black">Check Your Inbox</h4>
            <p className="text-xs text-neutral-700 leading-relaxed">
              We have simulated sending a recovery link to <strong>{email}</strong>. Check your spam folder if you do not receive it in 2 minutes.
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="w-full py-2.5 bg-black text-[#ffe17c] neo-btn rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-black">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@workshop.in"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white neo-input rounded-xl text-black font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#ffe17c] text-black neo-btn rounded-xl text-sm font-bold flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-700 hover:text-black hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </Link>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
