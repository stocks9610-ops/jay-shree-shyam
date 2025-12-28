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
    { date: "January 1, 2026", achievement: "AI Trader Mind Launch - Revolutionary AI-Powered Trading", icon: "🤖", future: true },
    { date: "December 2024", achievement: "50,000+ Active Traders Milestone Achieved", icon: "👥" },
    { date: "November 2024", achievement: "Featured in Major Financial Publications", icon: "📰" },
    { date: "October 2024", achievement: "$2.5M+ Total Profits Generated", icon: "💰" },
    { date: "September 2024", achievement: "Mobile App Launch - Trade Anywhere", icon: "📱" },
    { date: "August 2024", achievement: "Official Platform Launch - Global Expansion", icon: "🚀" },
    { date: "June 2024", achievement: "Beta Testing Phase - 1,000+ Early Adopters", icon: "🧪" },
    { date: "March 2024", achievement: "Copy Trading System Development", icon: "⚙️" },
    { date: "December 2023", achievement: "Platform Development Begins", icon: "💻" },
    { date: "October 2023", achievement: "Company Founded - Vision Created", icon: "🌟" }
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
                  <div className={`w-12 h-12 ${milestone.future ? 'bg-gradient-to-br from-[#f01a64] to-[#00b36b] animate-pulse' : 'bg-[#f01a64]/10 border-2 border-[#f01a64]'} rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                    {milestone.icon}
                  </div>
                  {index < milestones.length - 1 && (
                    <div className="w-0.5 h-full bg-gradient-to-b from-[#f01a64] to-transparent mt-2"></div>
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <div className={`${milestone.future ? 'text-[#00b36b]' : 'text-[#f01a64]'} text-xs font-black uppercase tracking-widest mb-1 flex items-center gap-2`}>
                    {milestone.date}
                    {milestone.future && <span className="bg-[#00b36b]/20 text-[#00b36b] px-2 py-0.5 rounded text-[8px]">COMING SOON</span>}
                  </div>
                  <div className="text-white text-base font-bold">
                    {milestone.achievement}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: VISUAL PROOF PLACEHOLDER */}
        <div>
          <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider mb-6 text-center">
            Platform Showcase
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 1, path: '/success/screenshot1.jpg', label: 'Trading Dashboard' },
              { id: 2, path: '/success/screenshot2.jpg', label: 'Profit Chart' },
              { id: 3, path: '/success/screenshot3.jpg', label: 'Withdrawal Proof' },
              { id: 4, path: '/success/screenshot4.jpg', label: 'Live Trades' },
              { id: 5, path: '/success/screenshot5.jpg', label: 'User Results' },
              { id: 6, path: '/success/screenshot6.jpg', label: 'Platform Features' },
              { id: 7, path: '/success/screenshot7.jpg', label: 'Mobile App' },
              { id: 8, path: '/success/screenshot8.jpg', label: 'Success Stories' }
            ].map((item) => (
              <div
                key={item.id}
                className="aspect-square bg-[#1e222d] border border-white/5 rounded-xl hover:border-[#00b36b]/30 transition-all flex items-center justify-center group cursor-pointer overflow-hidden"
              >
                <div className="text-center p-4">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📸</div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase leading-tight">
                    {item.label}
                  </div>
                  <div className="text-[8px] text-gray-600 mt-1 font-mono">
                    {item.path}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-[#1e222d] border border-[#f01a64]/20 rounded-xl p-4">
            <p className="text-center text-gray-400 text-xs font-bold mb-2">
              📤 Upload Instructions for Firebase Storage:
            </p>
            <ol className="text-[10px] text-gray-500 space-y-1 max-w-2xl mx-auto">
              <li>1. Go to Firebase Console → Storage</li>
              <li>2. Create folder: <code className="bg-black/30 px-1 rounded">success/</code></li>
              <li>3. Upload images: screenshot1.jpg, screenshot2.jpg, etc.</li>
              <li>4. Or upload user photos: user1.jpg through user6.jpg</li>
              <li>5. Images will automatically appear here!</li>
            </ol>
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
