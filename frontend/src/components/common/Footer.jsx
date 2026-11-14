import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Globe, Mail, Box, ShieldCheck, Share2, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#171e19] text-[#b7c6c2] border-t-4 border-black pt-16 pb-12 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        
        {/* Col 1: Brand Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#ffe17c] flex items-center justify-center neo-shadow-sm">
              <Sparkles className="w-5 h-5 text-black fill-black" />
            </div>
            <span className="font-heading font-extrabold text-2xl text-white tracking-wider">
              LOYALTY<span className="text-[#ffe17c]">BOX</span>
            </span>
          </div>
          <p className="text-sm text-[#b7c6c2]/80 leading-relaxed">
            Enterprise customer rewards and anti-counterfeiting verification platform tailored for physical boxed products and manufacturing industries.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <a href="https://example.com" target="_blank" rel="noreferrer" title="Website" className="w-9 h-9 bg-[#243028] border-2 border-black flex items-center justify-center text-white hover:bg-[#ffe17c] hover:text-black transition-colors rounded-lg">
              <Globe className="w-4 h-4" />
            </a>
            <a href="https://example.com" target="_blank" rel="noreferrer" title="Community" className="w-9 h-9 bg-[#243028] border-2 border-black flex items-center justify-center text-white hover:bg-[#ffe17c] hover:text-black transition-colors rounded-lg">
              <MessageCircle className="w-4 h-4" />
            </a>
            <a href="https://example.com" target="_blank" rel="noreferrer" title="Share" className="w-9 h-9 bg-[#243028] border-2 border-black flex items-center justify-center text-white hover:bg-[#ffe17c] hover:text-black transition-colors rounded-lg">
              <Share2 className="w-4 h-4" />
            </a>
            <a href="mailto:support@loyaltybox.factory.io" title="Email" className="w-9 h-9 bg-[#243028] border-2 border-black flex items-center justify-center text-white hover:bg-[#ffe17c] hover:text-black transition-colors rounded-lg">
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Col 2: Platform Links */}
        <div>
          <h4 className="font-heading font-bold text-white uppercase text-base tracking-wider mb-4 border-b-2 border-[#ffe17c] pb-1 inline-block">
            Platform
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/customer/redeem-code" className="hover:text-[#ffe17c] transition-colors">Redeem Box Code</Link></li>
            <li><Link to="/customer/rewards" className="hover:text-[#ffe17c] transition-colors">Rewards Marketplace</Link></li>
            <li><Link to="/customer/dashboard" className="hover:text-[#ffe17c] transition-colors">Customer Dashboard</Link></li>
            <li><Link to="/admin/dashboard" className="hover:text-[#ffe17c] transition-colors">Factory Owner Portal</Link></li>
            <li><Link to="/admin/codes" className="hover:text-[#ffe17c] transition-colors">Batch Code Generator</Link></li>
          </ul>
        </div>

        {/* Col 3: Customer Support */}
        <div>
          <h4 className="font-heading font-bold text-white uppercase text-base tracking-wider mb-4 border-b-2 border-[#ffe17c] pb-1 inline-block">
            Support
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li><a href="#how-it-works" className="hover:text-[#ffe17c] transition-colors">How Code Scans Work</a></li>
            <li><a href="#faq" className="hover:text-[#ffe17c] transition-colors">Code Verification FAQ</a></li>
            <li><span className="text-[#b7c6c2]/70">Factory Hotline: 1800-420-BOXES</span></li>
            <li><span className="text-[#b7c6c2]/70">Dealer Verification Desk</span></li>
            <li><Link to="/admin/fraud-monitoring" className="hover:text-[#ffe17c] transition-colors">Report Code Tampering</Link></li>
          </ul>
        </div>

        {/* Col 4: Legal & Security */}
        <div>
          <h4 className="font-heading font-bold text-white uppercase text-base tracking-wider mb-4 border-b-2 border-[#ffe17c] pb-1 inline-block">
            Legal & Trust
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li><span className="hover:text-[#ffe17c] cursor-pointer">Terms of Rewards Program</span></li>
            <li><span className="hover:text-[#ffe17c] cursor-pointer">Anti-Fraud & Code Policy</span></li>
            <li><span className="hover:text-[#ffe17c] cursor-pointer">Warranty & Authenticity Seal</span></li>
            <li><span className="hover:text-[#ffe17c] cursor-pointer">Privacy Notice</span></li>
          </ul>
          <div className="mt-4 p-3 bg-[#243028] border-2 border-black rounded-lg flex items-center gap-2 text-xs text-[#ffe17c]">
            <ShieldCheck className="w-5 h-5 flex-shrink-0" />
            <span>Cryptographic One-Time Code Verification Enabled</span>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-[#b7c6c2]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#b7c6c2]/60">
        <div>
          © {new Date().getFullYear()} LOYALTYBOX Systems Inc. All rights reserved. Neo-Brutalist Architecture.
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="hover:text-white">Customer Login</Link>
          <Link to="/admin/dashboard" className="hover:text-[#ffe17c] font-bold">Admin Console</Link>
        </div>
      </div>
    </footer>
  );
}
