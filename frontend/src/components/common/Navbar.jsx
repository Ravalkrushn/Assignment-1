import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Menu, X, ArrowRight } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'How It Works', path: '/#how-it-works' },
    { label: 'Features', path: '/#features' },
    { label: 'Rewards', path: '/#rewards-preview' },
    { label: 'About', path: '/#about' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-[#ffe17c] border-b-2 border-black z-50 flex items-center px-4 sm:px-8">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-black flex items-center justify-center neo-shadow-sm group-hover:translate-x-[1px] group-hover:translate-y-[1px] transition-transform">
            <Sparkles className="w-6 h-6 text-[#ffe17c] fill-[#ffe17c]" />
          </div>
          <span className="font-heading font-extrabold text-2xl tracking-wider text-black">
            LOYALTY<span className="bg-black text-[#ffe17c] px-1.5 py-0.5 ml-0.5">BOX</span>
          </span>
        </Link>

        {/* Center Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.path}
              className="font-body font-semibold text-black hover:underline decoration-2 underline-offset-4 text-base transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right CTA / Portal Switcher */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/admin/dashboard"
            className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider bg-white text-black neo-btn rounded-lg"
            title="Switch to Factory Admin Portal"
          >
            Admin Demo
          </Link>

          <Link
            to="/login"
            className="px-4 py-2 font-bold text-sm bg-transparent text-black neo-btn rounded-lg hover:bg-white/40"
          >
            Login
          </Link>

          <Link
            to="/customer/dashboard"
            className="px-5 py-2 font-bold text-sm bg-black text-white neo-btn rounded-lg hover:bg-neutral-800"
          >
            Customer App <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 bg-white neo-btn rounded-lg"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-[#ffe17c] border-b-4 border-black p-6 flex flex-col gap-4 neo-shadow-lg">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="font-heading font-bold text-xl py-2 border-b border-black/10"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 flex flex-col gap-3">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 bg-white text-black neo-btn rounded-lg text-center"
            >
              Customer Login
            </Link>
            <Link
              to="/customer/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 bg-black text-[#ffe17c] neo-btn rounded-lg text-center"
            >
              Open Customer Portal
            </Link>
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 bg-[#b7c6c2] text-black neo-btn rounded-lg text-center"
            >
              Open Factory Admin Portal
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
