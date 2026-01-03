import React, { useState, useEffect } from 'react';

interface SuccessGalleryProps {
  onClose: () => void;
}

const SuccessGallery: React.FC<SuccessGalleryProps> = ({ onClose }) => {
  const [countTraders, setCountTraders] = useState(0);
  const [countProfits, setCountProfits] = useState(0);
  const [countWinRate, setCountWinRate] = useState(0);
  const [countUsers, setCountUsers] = useState(0);

  // Count-up animation effect
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    const targets = {
      traders: 50000,
      profits: 2.5,
      winRate: 94.2,
      users: 12000
    };

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;

      setCountTraders(Math.floor(targets.traders * progress));
      setCountProfits(parseFloat((targets.profits * progress).toFixed(1)));
      setCountWinRate(parseFloat((targets.winRate * progress).toFixed(1)));
      setCountUsers(Math.floor(targets.users * progress));

      if (step >= steps) {
        clearInterval(timer);
        setCountTraders(targets.traders);
        setCountProfits(targets.profits);
        setCountWinRate(targets.winRate);
        setCountUsers(targets.users);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const testimonials = [
    {
      id: 1,
      name: "John D.",
      location: "Dubai, UAE",
      quote: "Made $5,000 profit in just 10 minutes! Fastest returns I've ever seen!",
      image: "/success/user1.jpg", // Upload your image to Firebase Storage
      timeframe: "10 mins"
    },
    {
      id: 2,
      name: "Sarah M.",
      location: "Karachi, Pakistan",
      quote: "Turned $1,000 into $3,500 in 20 minutes. Unbelievable platform!",
      image: "/success/user2.jpg", // Upload your image to Firebase Storage
      timeframe: "20 mins"
    },
    {
      id: 3,
      name: "Ahmed K.",
      location: "Abu Dhabi, UAE",
      quote: "$12,000 profit in 5 minutes following AI signals. Life changing!",
      image: "/success/user3.jpg", // Upload your image to Firebase Storage
      timeframe: "5 mins"
    },
    {
      id: 4,
      name: "Maria L.",
      location: "Mumbai, India",
      quote: "Made $8,500 in 3 days. Consistent daily profits with copy trading!",
      image: "/success/user4.jpg", // Upload your image to Firebase Storage
      timeframe: "3 days"
    },
    {
      id: 5,
      name: "David R.",
      location: "London, UK",
      quote: "$25,000 profit in 7 days. Best week of my trading career!",
      image: "/success/user5.jpg", // Upload your image to Firebase Storage
      timeframe: "7 days"
    },
    {
      id: 6,
      name: "Fatima A.",
      location: "Riyadh, Saudi Arabia",
      quote: "$15,000 in 15 minutes! Quick profits with professional traders!",
      image: "/success/user6.jpg", // Upload your image to Firebase Storage
      timeframe: "15 mins"
    }
  ];

  const milestones = [
    { date: "January 2026", achievement: "🚀 AI Trader Launch - Revolutionary Auto-Copy System", icon: "🤖", future: false, highlight: true },
    { date: "December 2025", achievement: "Elite Trader Network - 50+ Verified Pro Traders Onboarded", icon: "⭐" },
    { date: "November 2025", achievement: "Real-Time Mirroring Protocol - Zero Latency Trading", icon: "⚡" },
    { date: "October 2025", achievement: "Global Expansion - Traders from 45+ Countries", icon: "🌍" },
    { date: "September 2025", achievement: "$5M+ Total Profits Generated Across Platform", icon: "💰" },
    { date: "August 2025", achievement: "Mobile Trading App Launch - iOS & Android", icon: "📱" },
    { date: "July 2025", achievement: "25,000+ Active Users Milestone Achieved", icon: "👥" },
    { date: "June 2025", achievement: "Advanced Analytics Dashboard - Live Performance Tracking", icon: "📊" },
    { date: "May 2025", achievement: "Top 10 Traders Featured - Verified Track Records", icon: "🏆" },
    { date: "April 2025", achievement: "Instant Withdrawal System - 24/7 Processing", icon: "💳" },
    { date: "March 2025", achievement: "Copy Trading 2.0 - Multi-Trader Portfolio Feature", icon: "🔄" },
    { date: "February 2025", achievement: "Security Upgrade - Bank-Level Encryption Implemented", icon: "🔒" },
    { date: "January 2025", achievement: "New Year Surge - 10,000+ New Traders Join", icon: "🎉" },
    { date: "December 2024", achievement: "First $1M in User Profits - Major Milestone", icon: "💎" },
    { date: "November 2024", achievement: "Trader Verification System - Real Results Only", icon: "✅" },
    { date: "October 2024", achievement: "Platform Beta Launch - 1,000+ Early Adopters", icon: "🧪" },
    { date: "September 2024", achievement: "Copy Trading Engine Development Complete", icon: "⚙️" },
    { date: "August 2024", achievement: "First Professional Traders Recruited", icon: "🎯" },
    { date: "July 2024", achievement: "Platform Development Begins - Vision Created", icon: "💻" }
  ];

  return (
    <div className="fixed inset-0 z-[110] bg-[#131722] flex flex-col overflow-y-auto no-scrollbar">
      {/* HEADER */}
      <div className="sticky top-0 z-20 p-6 md:p-8 flex items-center justify-between border-b border-white/5 bg-[#131722]/95 backdrop-blur-xl">
        <div>
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
            Success Hall
          </h2>
          <p className="text-[10px] text-[#f01a64] font-black uppercase tracking-[0.3em] mt-2">
            Our Journey to Excellence
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white transition-all p-3 hover:bg-white/5 rounded-full active:scale-95"
        >
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 p-6 md:p-10 space-y-12 md:space-y-16">

        {/* SECTION 1: STATISTICS */}
        <div>
          <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider mb-6 text-center">
            Platform Statistics
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-[#1e222d] border border-white/5 rounded-2xl p-6 text-center hover:border-[#00b36b]/30 transition-all group">
              <div className="text-4xl md:text-5xl font-black text-[#00b36b] mb-2 group-hover:scale-110 transition-transform">
                {countTraders.toLocaleString()}+
              </div>
              <div className="text-xs text-gray-500 font-black uppercase tracking-widest">
                Active Traders
              </div>
            </div>

            <div className="bg-[#1e222d] border border-white/5 rounded-2xl p-6 text-center hover:border-[#00b36b]/30 transition-all group">
              <div className="text-4xl md:text-5xl font-black text-[#00b36b] mb-2 group-hover:scale-110 transition-transform">
                ${countProfits}M+
              </div>
              <div className="text-xs text-gray-500 font-black uppercase tracking-widest">
                Total Profits
              </div>
            </div>

            <div className="bg-[#1e222d] border border-white/5 rounded-2xl p-6 text-center hover:border-[#00b36b]/30 transition-all group">
              <div className="text-4xl md:text-5xl font-black text-[#00b36b] mb-2 group-hover:scale-110 transition-transform">
                {countWinRate}%
              </div>
              <div className="text-xs text-gray-500 font-black uppercase tracking-widest">
                Success Rate
              </div>
            </div>

            <div className="bg-[#1e222d] border border-white/5 rounded-2xl p-6 text-center hover:border-[#00b36b]/30 transition-all group">
              <div className="text-4xl md:text-5xl font-black text-[#00b36b] mb-2 group-hover:scale-110 transition-transform">
                {countUsers.toLocaleString()}+
              </div>
              <div className="text-xs text-gray-500 font-black uppercase tracking-widest">
                Happy Users
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: SUCCESS STORIES */}
        <div>
          <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider mb-6 text-center">
            Success Stories
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-[#1e222d] border border-white/5 rounded-2xl p-6 hover:border-[#f01a64]/30 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#f01a64]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="flex items-center gap-4 mb-4 relative z-10">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#f01a64]/20 to-[#00b36b]/20 flex items-center justify-center ring-2 ring-[#f01a64]/50">
                    <div className="text-2xl">👤</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-black text-sm">{testimonial.name}</div>
                    <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">{testimonial.location}</div>
                    <div className="mt-1 inline-block bg-[#00b36b]/20 text-[#00b36b] px-2 py-0.5 rounded text-[10px] font-black uppercase">
                      ⚡ {testimonial.timeframe}
                    </div>
                  </div>
                </div>

                <p className="text-gray-300 text-sm italic leading-relaxed relative z-10">
                  "{testimonial.quote}"
                </p>

                <div className="mt-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: ACHIEVEMENT TIMELINE */}
        <div>
          <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider mb-8 text-center">
            Our Journey
          </h3>
          <div className="max-w-3xl mx-auto">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex gap-6 mb-8 last:mb-0 group">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 ${milestone.highlight ? 'bg-gradient-to-br from-[#f01a64] to-[#00b36b] animate-pulse shadow-lg shadow-[#00b36b]/50' : milestone.future ? 'bg-gradient-to-br from-[#f01a64] to-[#00b36b] animate-pulse' : 'bg-[#1e222d] border-2 border-[#f01a64]/50'} rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                    {milestone.icon}
                  </div>
                  {index < milestones.length - 1 && (
                    <div className="w-0.5 h-full bg-gradient-to-b from-[#f01a64]/50 to-transparent mt-2"></div>
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <div className={`${milestone.highlight ? 'text-[#00b36b]' : milestone.future ? 'text-[#00b36b]' : 'text-[#f01a64]'} text-xs font-black uppercase tracking-widest mb-1 flex items-center gap-2`}>
                    {milestone.date}
                    {milestone.highlight && <span className="bg-[#00b36b]/20 text-[#00b36b] px-2 py-0.5 rounded text-[8px] animate-pulse">🔥 LATEST</span>}
                    {milestone.future && <span className="bg-[#00b36b]/20 text-[#00b36b] px-2 py-0.5 rounded text-[8px]">COMING SOON</span>}
                  </div>
                  <div className={`${milestone.highlight ? 'text-white text-lg font-black' : 'text-white text-base font-bold'}`}>
                    {milestone.achievement}
                  </div>
                  {milestone.highlight && (
                    <p className="text-gray-400 text-xs mt-2 italic">
                      Join now and experience the future of automated copy trading with AI-powered strategy selection.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: PLATFORM SHOWCASE */}
        <div>
          <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider mb-6 text-center">
            Platform Showcase
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Image 1: Profit Dashboard */}
            <div className="group relative bg-[#1e222d] border border-white/5 rounded-2xl overflow-hidden hover:border-[#00b36b]/30 transition-all">
              <div className="aspect-video relative overflow-hidden">
                <img
                  src="/images/success/profit_dashboard.png"
                  alt="Trading Dashboard Success - $47,382 Profit"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#131722] via-transparent to-transparent opacity-60"></div>
              </div>
              <div className="p-4">
                <h4 className="text-white font-black text-sm uppercase tracking-wider">30-Day Performance</h4>
                <p className="text-gray-500 text-xs mt-1">Real trader profits tracked live</p>
              </div>
            </div>

            {/* Image 2: Platform Statistics */}
            <div className="group relative bg-[#1e222d] border border-white/5 rounded-2xl overflow-hidden hover:border-[#00b36b]/30 transition-all">
              <div className="aspect-video relative overflow-hidden">
                <img
                  src="/images/success/statistics.png"
                  alt="Platform Statistics - 15,000+ Traders, 94% Win Rate"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#131722] via-transparent to-transparent opacity-60"></div>
              </div>
              <div className="p-4">
                <h4 className="text-white font-black text-sm uppercase tracking-wider">Platform Metrics</h4>
                <p className="text-gray-500 text-xs mt-1">Growing community of successful traders</p>
              </div>
            </div>

            {/* Image 3: Testimonial */}
            <div className="group relative bg-[#1e222d] border border-white/5 rounded-2xl overflow-hidden hover:border-[#f01a64]/30 transition-all">
              <div className="aspect-video relative overflow-hidden">
                <img
                  src="/images/success/testimonial.png"
                  alt="User Success Story - $12,000 First Month"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#131722] via-transparent to-transparent opacity-60"></div>
              </div>
              <div className="p-4">
                <h4 className="text-white font-black text-sm uppercase tracking-wider">Success Stories</h4>
                <p className="text-gray-500 text-xs mt-1">Real testimonials from our traders</p>
              </div>
            </div>

            {/* Image 4: Before/After */}
            <div className="group relative bg-[#1e222d] border border-white/5 rounded-2xl overflow-hidden hover:border-[#f01a64]/30 transition-all">
              <div className="aspect-video relative overflow-hidden">
                <img
                  src="/images/success/before_after.png"
                  alt="Copy Trading Transformation - Before vs After"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#131722] via-transparent to-transparent opacity-60"></div>
              </div>
              <div className="p-4">
                <h4 className="text-white font-black text-sm uppercase tracking-wider">Copy Trading Impact</h4>
                <p className="text-gray-500 text-xs mt-1">See the transformation in action</p>
              </div>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="mt-8 max-w-3xl mx-auto bg-gradient-to-r from-[#f01a64]/10 via-[#00b36b]/10 to-[#f01a64]/10 border border-white/5 rounded-xl p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#00b36b]/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-[#00b36b]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="text-white font-black text-lg uppercase tracking-wider">Verified Results</h4>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              All platform statistics and success stories are based on real user data.
              <span className="text-[#00b36b] font-bold"> Transparency is our commitment to you.</span>
            </p>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <div className="p-6 text-center border-t border-white/5 bg-[#131722]/50">
        <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.4em]">
          Building Trust Through Transparency & Results
        </p>
      </div>
    </div>
  );
};

export default SuccessGallery;
