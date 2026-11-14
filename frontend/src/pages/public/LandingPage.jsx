import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  QrCode, 
  Gift, 
  ShieldCheck, 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  Factory, 
  ShieldAlert,
  Award,
  Zap
} from 'lucide-react';

export default function LandingPage() {
  const marqueeItems = [
    "SMART REWARDS",
    "CUSTOMER LOYALTY",
    "SECURE REDEMPTION",
    "EXCLUSIVE BENEFITS",
    "REWARD YOURSELF",
    "ANTI-COUNTERFEIT CODES",
    "FACTORY DIRECT VALUE",
    "ZERO FRAUD TOLERANCE"
  ];

  const features = [
    {
      icon: QrCode,
      title: "Unique Product Codes",
      description: "Cryptographically generated one-time alphanumeric codes printed under tamper-evident scratch seals inside every product box."
    },
    {
      icon: Zap,
      title: "Instant Points Crediting",
      description: "Immediate verification and point allocation to the customer's wallet upon scanning or entering the code."
    },
    {
      icon: Gift,
      title: "Exciting Rewards",
      description: "A rich catalog featuring cash discount coupons, complimentary factory replacement parts, branded merchandise, and gift cards."
    },
    {
      icon: ShieldCheck,
      title: "Secure Redemption",
      description: "Multi-layered validation engine preventing code replay, brute-force guessing, and duplicate claiming across distributors."
    },
    {
      icon: LayoutDashboard,
      title: "Customer Dashboard",
      description: "Complete transparent visibility into available points, redemption transaction history, tier progression, and claimed rewards."
    },
    {
      icon: BarChart3,
      title: "Business Analytics",
      description: "Factory owners gain granular real-time visibility into batch activation rates, geographic scan heatmaps, and repeat buyers."
    }
  ];

  const personas = [
    {
      role: "CUSTOMER",
      tag: "End Buyer / Workshop",
      icon: Users,
      description: "Purchases factory products in boxes, scans inner scratch codes, collects reward points, and claims attractive rewards and discounts.",
      link: "/customer/dashboard",
      linkText: "Explore Customer Portal",
      accent: "#ffffff"
    },
    {
      role: "FACTORY OWNER",
      tag: "Manufacturer / Leadership",
      icon: Factory,
      description: "Manages product lines, generates secured code batches, creates reward tiers, monitors unit sales velocity, and drives brand loyalty.",
      link: "/admin/dashboard",
      linkText: "Open Factory Admin",
      accent: "#ffe17c"
    },
    {
      role: "ADMINISTRATOR",
      tag: "Security / Operations",
      icon: ShieldAlert,
      description: "Monitors code redemption logs, detects abnormal scan velocity, reviews flagged IPs, and safeguards against warranty abuse.",
      link: "/admin/fraud-monitoring",
      linkText: "View Security Center",
      accent: "#b7c6c2"
    }
  ];

  const testimonials = [
    {
      quote: "Scanning the box codes from our monthly bearing supply has earned our workshop over ₹12,000 in tool upgrades. Super simple and zero hassle.",
      author: "Manoj Kumar",
      designation: "Head Machinist, Precision Auto Works",
      location: "Pune, MH"
    },
    {
      quote: "Before this system, our factory had no direct connection to the workshops buying our boxed seals. Today we have 5,000+ active loyal mechanics.",
      author: "Harish Patel",
      designation: "Managing Director, Apex Components",
      location: "Chakan Industrial Zone"
    },
    {
      quote: "The instant code verification gives me confidence that I am receiving 100% authentic genuine factory parts, not cheap counterfeits.",
      author: "Vikramjit Singh",
      designation: "Heavy Equipment Contractor",
      location: "Ludhiana, PB"
    }
  ];

  return (
    <div className="flex flex-col">
      {/* 1. HERO SECTION */}
      <section className="bg-[#ffe17c] bg-dots border-b-2 border-black py-16 sm:py-24 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-black text-[#ffe17c] font-heading font-black text-xs uppercase tracking-widest neo-shadow-sm rounded-md">
              <Sparkles className="w-3.5 h-3.5" />
              SMART CUSTOMER REWARDS PLATFORM
            </div>

            <h1 className="font-heading font-extrabold text-4xl sm:text-6xl md:text-7xl leading-[1.05] text-black">
              Every Box. <br />
              Every Purchase. <br />
              Every <span className="bg-black text-[#ffe17c] px-3 py-0.5 rounded-lg inline-block transform -rotate-1">Reward.</span>
            </h1>

            <p className="font-body text-base sm:text-xl text-neutral-900 max-w-xl font-medium leading-relaxed">
              Turn every physical product purchase into a lasting, rewarding partnership. Scan unique product box codes, collect instant loyalty points, and unlock exclusive gifts and rebates.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/customer/redeem-code"
                className="px-6 py-4 bg-black text-[#ffe17c] neo-btn-lg text-base rounded-xl flex items-center justify-center gap-2"
              >
                <span>Start Earning Rewards</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#how-it-works"
                className="px-6 py-4 bg-white text-black neo-btn-lg text-base rounded-xl flex items-center justify-center gap-2"
              >
                <span>Explore How It Works</span>
              </a>
            </div>

            {/* Micro proof points */}
            <div className="pt-6 flex flex-wrap items-center gap-6 text-xs font-bold text-neutral-800">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Tamper-Evident Codes
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Instant Point Delivery
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Zero Backend Setup Demo
              </div>
            </div>
          </div>

          {/* Right Column: Browser Mockup of Customer Loyalty Dashboard */}
          <div className="lg:col-span-5">
            <div className="neo-card-lg bg-white rounded-2xl overflow-hidden">
              {/* Browser Window Header */}
              <div className="bg-[#171e19] px-4 py-3 border-b-2 border-black flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 border border-black" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400 border border-black" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500 border border-black" />
                </div>
                <div className="bg-[#243028] px-3 py-1 rounded text-[11px] font-mono text-[#b7c6c2] border border-black/30 truncate max-w-[200px]">
                  loyaltybox.app/customer/dashboard
                </div>
                <div className="w-4" />
              </div>

              {/* Mockup Dashboard Content */}
              <div className="p-5 bg-[#fbfaf5] space-y-4">
                
                {/* Top Mock Stats */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-3 bg-[#ffe17c] border-2 border-black rounded-xl neo-shadow-sm">
                    <p className="text-[10px] font-bold uppercase text-black/70">Available</p>
                    <p className="font-heading font-black text-xl text-black">1,250</p>
                    <p className="text-[9px] font-bold text-black/60">Points</p>
                  </div>
                  <div className="p-3 bg-white border-2 border-black rounded-xl neo-shadow-sm">
                    <p className="text-[10px] font-bold uppercase text-neutral-500">Boxes</p>
                    <p className="font-heading font-black text-xl text-black">25</p>
                    <p className="text-[9px] font-bold text-neutral-500">Scanned</p>
                  </div>
                  <div className="p-3 bg-[#b7c6c2] border-2 border-black rounded-xl neo-shadow-sm">
                    <p className="text-[10px] font-bold uppercase text-black/70">Rewards</p>
                    <p className="font-heading font-black text-xl text-black">8</p>
                    <p className="text-[9px] font-bold text-black/60">Available</p>
                  </div>
                </div>

                {/* Reward Progress Card */}
                <div className="p-3.5 bg-white border-2 border-black rounded-xl neo-shadow-sm">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Gift className="w-4 h-4 text-black" /> Next: Premium Factory Gift Box
                    </span>
                    <span className="text-black">1,250 / 1,500</span>
                  </div>
                  <div className="w-full h-3 bg-neutral-100 border-2 border-black rounded-full overflow-hidden">
                    <div className="h-full bg-[#ffe17c] border-r-2 border-black w-[83%]" />
                  </div>
                  <p className="text-[11px] text-neutral-600 mt-2 font-medium">
                    ⚡ You need <strong>250 more points</strong> to unlock your Premium Gift.
                  </p>
                </div>

                {/* Recent Activity Pill */}
                <div className="p-3 bg-[#171e19] text-white border-2 border-black rounded-xl neo-shadow-sm">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-heading font-bold text-[#ffe17c] uppercase tracking-wider">Latest Activity</span>
                    <span className="text-[10px] text-[#b7c6c2]">Today 16:45</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">Bearing Box (Set of 4)</p>
                      <p className="text-[10px] text-[#b7c6c2] font-mono">BOX-GOLD-8899</p>
                    </div>
                    <span className="px-2 py-0.5 bg-[#ffe17c] text-black font-black rounded border border-black">
                      +100 PTS
                    </span>
                  </div>
                </div>

                {/* Quick Link to App */}
                <Link
                  to="/customer/dashboard"
                  className="w-full py-2.5 bg-black text-[#ffe17c] neo-btn rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <span>Open Live Interactive Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. SOCIAL PROOF MARQUEE */}
      <section className="bg-[#171e19] border-b-2 border-black py-4 overflow-hidden select-none">
        <div className="animate-marquee flex items-center gap-12 whitespace-nowrap">
          {marqueeItems.concat(marqueeItems).map((text, idx) => (
            <div key={idx} className="flex items-center gap-6">
              <span className="font-heading font-extrabold text-sm sm:text-base uppercase tracking-widest text-[#b7c6c2]">
                {text}
              </span>
              <Sparkles className="w-4 h-4 text-[#ffe17c] fill-[#ffe17c]" />
            </div>
          ))}
        </div>
      </section>

      {/* 3. PROBLEM VS SOLUTION */}
      <section className="bg-white border-b-2 border-black py-20 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest bg-[#b7c6c2] px-2.5 py-1 border border-black rounded">
              The Packaging Problem
            </span>
            <h2 className="font-heading font-black text-3xl sm:text-5xl text-black">
              Why Traditional Boxed Products Lose Customer Loyalty
            </h2>
            <p className="text-neutral-600 font-medium text-sm sm:text-base">
              Factory products are sold through multiple distributor tiers. Without an inner-box rewards loop, manufacturers have zero direct connection to the end users.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* PROBLEM CARD */}
            <div className="p-8 bg-[#fff5f5] border-2 border-black rounded-2xl neo-shadow-lg space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500 border-2 border-black rounded-xl flex items-center justify-center text-white neo-shadow-sm">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-2xl text-black">The Problem</h3>
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Traditional Distribution Blindspot</p>
                </div>
              </div>

              <ul className="space-y-4 font-body">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-red-200 border border-black text-red-800 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">✕</span>
                  <p className="text-sm font-semibold text-neutral-800">
                    <strong>Zero end-customer connection:</strong> Factories never know who opens the box, making loyalty building impossible.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-red-200 border border-black text-red-800 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">✕</span>
                  <p className="text-sm font-semibold text-neutral-800">
                    <strong>Counterfeits & fake packaging:</strong> Unscrupulous copycats mimic external box art with zero authenticity verification.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-red-200 border border-black text-red-800 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">✕</span>
                  <p className="text-sm font-semibold text-neutral-800">
                    <strong>Cumbersome paper warranty coupons:</strong> Slow, manual postal rebate slips that 92% of mechanics and workshops discard.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-red-200 border border-black text-red-800 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">✕</span>
                  <p className="text-sm font-semibold text-neutral-800">
                    <strong>Blind inventory analytics:</strong> Factory owners cannot track real-time consumption velocity across regional markets.
                  </p>
                </li>
              </ul>
            </div>

            {/* SOLUTION CARD */}
            <div className="p-8 bg-[#f2faf5] border-2 border-black rounded-2xl neo-shadow-lg space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 border-2 border-black rounded-xl flex items-center justify-center text-white neo-shadow-sm">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-2xl text-black">The LOYALTYBOX Solution</h3>
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Direct Manufacturer-to-User Rewards</p>
                </div>
              </div>

              <ul className="space-y-4 font-body">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-200 border border-black text-emerald-800 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                  <p className="text-sm font-semibold text-neutral-800">
                    <strong>Instant rewards on every purchase:</strong> One scan inside the box credits points directly into the customer's mobile wallet.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-200 border border-black text-emerald-800 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                  <p className="text-sm font-semibold text-neutral-800">
                    <strong>Tamper-evident authenticity guarantee:</strong> Customers prove genuine product purchase and prevent counterfeit scams.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-200 border border-black text-emerald-800 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                  <p className="text-sm font-semibold text-neutral-800">
                    <strong>Rich rewards catalog:</strong> Instant cash discounts, spare parts, tools, and holiday gift crates claimable in one click.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-200 border border-black text-emerald-800 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                  <p className="text-sm font-semibold text-neutral-800">
                    <strong>Factory Owner intelligence:</strong> Live dashboard tracking batch scan rates, top buyers, and automated fraud prevention.
                  </p>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* 4. FEATURE GRID */}
      <section id="features" className="bg-[#ffe17c] border-b-2 border-black py-20 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest bg-black text-[#ffe17c] px-3 py-1 rounded">
              Platform Features
            </span>
            <h2 className="font-heading font-black text-3xl sm:text-5xl text-black">
              Engineered For Physical Boxed Products
            </h2>
            <p className="text-neutral-900 font-medium text-sm sm:text-base">
              Every detail is tailored to the manufacturing and physical supply chain workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div
                  key={idx}
                  className="p-6 bg-white border-2 border-black rounded-xl neo-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] transition-all space-y-3 group"
                >
                  <div className="w-12 h-12 bg-[#ffe17c] border-2 border-black rounded-xl flex items-center justify-center neo-shadow-sm group-hover:bg-black group-hover:text-[#ffe17c] transition-colors">
                    <Icon className="w-6 h-6 text-black group-hover:text-[#ffe17c]" />
                  </div>
                  <h3 className="font-heading font-extrabold text-xl text-black pt-2">
                    {f.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-medium">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section id="how-it-works" className="bg-[#171e19] text-white border-b-2 border-black py-20 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest bg-[#ffe17c] text-black px-3 py-1 rounded border border-black">
              Seamless 3-Step Journey
            </span>
            <h2 className="font-heading font-black text-3xl sm:text-5xl text-white">
              How The Reward System Works
            </h2>
            <p className="text-[#b7c6c2] text-sm sm:text-base">
              Zero complicated forms. Fast verification designed for workshops and everyday buyers.
            </p>
          </div>

          {/* Three horizontal steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="relative p-6 bg-[#243028] border-2 border-black rounded-2xl neo-shadow-lg text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#ffe17c] text-black font-heading font-black text-2xl flex items-center justify-center border-2 border-black neo-shadow-sm">
                01
              </div>
              <h3 className="font-heading font-extrabold text-xl text-white">
                Buy a Product Box
              </h3>
              <p className="text-xs sm:text-sm text-[#b7c6c2] leading-relaxed">
                Purchase an authentic factory product box from any authorized distributor, wholesaler, or hardware outlet.
              </p>
              <div className="pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-black/40 text-[#ffe17c] rounded border border-black/40">
                  Step 1 • Retail Purchase
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 bg-[#243028] border-2 border-black rounded-2xl neo-shadow-lg text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-white text-black font-heading font-black text-2xl flex items-center justify-center border-2 border-black neo-shadow-sm">
                02
              </div>
              <h3 className="font-heading font-extrabold text-xl text-white">
                Enter Inner-Box Code
              </h3>
              <p className="text-xs sm:text-sm text-[#b7c6c2] leading-relaxed">
                Scratch or reveal the unique alphanumeric code printed on the security sticker inside the product box packaging.
              </p>
              <div className="pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-black/40 text-[#ffe17c] rounded border border-black/40">
                  Step 2 • Single-Use Code
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 bg-[#243028] border-2 border-black rounded-2xl neo-shadow-lg text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#b7c6c2] text-black font-heading font-black text-2xl flex items-center justify-center border-2 border-black neo-shadow-sm">
                03
              </div>
              <h3 className="font-heading font-extrabold text-xl text-white">
                Earn & Redeem
              </h3>
              <p className="text-xs sm:text-sm text-[#b7c6c2] leading-relaxed">
                Receive instant loyalty points into your balance. Exchange points for cash discounts, toolkits, or factory merchandise.
              </p>
              <div className="pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-black/40 text-[#ffe17c] rounded border border-black/40">
                  Step 3 • Instant Rewards
                </span>
              </div>
            </div>

          </div>

          <div className="text-center pt-4">
            <Link
              to="/customer/redeem-code"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#ffe17c] text-black neo-btn-lg text-base rounded-xl"
            >
              <QrCode className="w-5 h-5" />
              <span>Try Interactive Redemption Simulation</span>
            </Link>
          </div>

        </div>
      </section>

      {/* 6. USER PERSONAS */}
      <section className="bg-white border-b-2 border-black py-20 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest bg-[#ffe17c] px-3 py-1 border border-black rounded">
              Tailored For Everyone
            </span>
            <h2 className="font-heading font-black text-3xl sm:text-5xl text-black">
              Explore User Personas
            </h2>
            <p className="text-neutral-600 text-sm sm:text-base">
              The platform provides specialized portals tailored to each stakeholder.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {personas.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="p-8 border-2 border-black rounded-2xl neo-shadow-lg flex flex-col justify-between space-y-6"
                  style={{ backgroundColor: p.accent }}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-black text-[#ffe17c] rounded-xl flex items-center justify-center border-2 border-black neo-shadow-sm">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-black text-white rounded">
                        {p.tag}
                      </span>
                    </div>

                    <h3 className="font-heading font-black text-2xl text-black">
                      {p.role}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-medium">
                      {p.description}
                    </p>
                  </div>

                  <Link
                    to={p.link}
                    className="w-full py-3 bg-black text-white neo-btn rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <span>{p.linkText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 7. TESTIMONIALS */}
      <section className="bg-[#b7c6c2] border-b-2 border-black py-20 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest bg-white text-black px-3 py-1 border border-black rounded">
              Customer Feedback
            </span>
            <h2 className="font-heading font-black text-3xl sm:text-5xl text-black">
              Trusted Across Industrial Workshops
            </h2>
            <p className="text-neutral-800 text-xs sm:text-sm italic">
              * The testimonials below are sample fictional feedback illustrating user experience scenarios.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="p-6 bg-white border-2 border-black rounded-2xl neo-shadow space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex gap-1 text-[#ffe17c]">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-lg">★</span>
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-800 italic leading-relaxed">
                    "{t.quote}"
                  </p>
                </div>

                <div className="pt-4 border-t-2 border-black/10">
                  <p className="font-heading font-bold text-sm text-black">{t.author}</p>
                  <p className="text-xs text-neutral-600">{t.designation}</p>
                  <p className="text-[10px] font-bold text-neutral-400 mt-0.5">{t.location}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section className="bg-[#ffe17c] bg-dots border-b-2 border-black py-20 px-4 sm:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-block p-2 bg-black rounded-xl text-[#ffe17c] neo-shadow-sm">
            <Award className="w-8 h-8" />
          </div>

          <h2 className="font-heading font-black text-4xl sm:text-6xl text-black">
            Your Next Purchase <br />
            Deserves a Reward.
          </h2>

          <p className="text-base sm:text-lg text-neutral-900 font-medium max-w-xl mx-auto">
            Join thousands of workshops and technicians already redeeming points on every single authentic product box.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-4 bg-black text-[#ffe17c] neo-btn-lg text-base rounded-xl flex items-center justify-center gap-2"
            >
              <span>Join the Rewards Program</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/customer/redeem-code"
              className="px-8 py-4 bg-white text-black neo-btn-lg text-base rounded-xl flex items-center justify-center gap-2"
            >
              <QrCode className="w-5 h-5" />
              <span>Redeem Product Box Code</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
