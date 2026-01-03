
import React, { useEffect, useState } from 'react';
import { Trader } from '../types';

interface TraderProfileCardProps {
  trader: Trader;
  currentProfit: number;
  currentWinRate: number;
  onClose: () => void;
}

const TraderProfileCard: React.FC<TraderProfileCardProps> = ({ 
  trader, 
  currentProfit, 
  currentWinRate,
  onClose 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
  }, [trader]);

  return (
    <div className={`
      relative w-full bg-[#1e222d] border-l-4 border-[#f01a64] rounded-r-2xl p-6 md:p-8 mb-6 
      shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-500
      ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
    `}>
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#f01a64]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
        
        {/* Avatar Section */}
        <div className="relative shrink-0 group">
          <div className="absolute -inset-1 bg-gradient-to-br from-[#f01a64] to-[#f01a64]/20 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500"></div>
          <img 
            src={trader.avatar} 
            alt={trader.name} 
            className="relative w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-[#1e222d] z-10"
          />
          <div className="absolute bottom-2 right-2 z-20 w-6 h-6 bg-[#00b36b] border-4 border-[#1e222d] rounded-full animate-pulse"></div>
        </div>

        {/* Info Section */}
        <div className="flex-grow text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row items-center md:items-baseline gap-3">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase italic">
              {trader.name}
            </h2>
            <span className="px-3 py-1 bg-[#f01a64]/10 border border-[#f01a64]/20 text-[#f01a64] rounded-lg text-[10px] font-black uppercase tracking-widest">
              Verified Pro
            </span>
          </div>
          
          <p className="text-gray-400 text-sm md:text-base font-medium max-w-2xl leading-relaxed">
            {trader.bio || "Specializes in high-frequency algorithmic trading across crypto and forex markets. Maintaining a strict risk management protocol with consistent compounding growth."}
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
             <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-black/20 px-3 py-2 rounded-lg">
                <span className="w-2 h-2 bg-[#00b36b] rounded-full"></span>
                ACTIVE SESSION
             </div>
             <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-black/20 px-3 py-2 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {trader.weeks} WEEKS HISTORY
             </div>
          </div>
        </div>

        {/* Key Stats (Right Side) */}
        <div className="flex flex-row md:flex-col gap-4 shrink-0 min-w-[200px]">
          <div className="bg-[#131722] p-4 rounded-xl border border-white/5 text-center group hover:border-[#f01a64]/30 transition-colors">
            <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest block mb-1">Current ROI</span>
            <span className="text-2xl font-black text-[#00b36b]">+{trader.roi}%</span>
          </div>
          <div className="bg-[#131722] p-4 rounded-xl border border-white/5 text-center group hover:border-[#f01a64]/30 transition-colors">
            <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest block mb-1">Win Rate</span>
            <span className="text-2xl font-black text-[#f01a64]">{currentWinRate.toFixed(1)}%</span>
          </div>
        </div>

      </div>
      
      {/* Connection Graphic / Live Line */}
      <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-[#f01a64] via-[#f01a64]/50 to-transparent"></div>
    </div>
  );
};

export default TraderProfileCard;
