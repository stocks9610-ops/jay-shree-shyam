import React from 'react';
import FloatingFlags from './FloatingFlags';

interface HeroProps {
  hasDeposited: boolean;
  onJoinClick: () => void;
  onInstallRequest: () => Promise<boolean>;
  onStartJourney?: () => void;
  externalShowMentorship?: () => void;
  onShareClick?: () => void;
}

const Hero: React.FC<HeroProps> = ({ hasDeposited, onJoinClick, onInstallRequest, onStartJourney, externalShowMentorship, onShareClick }) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-24 md:pt-32 md:pb-56 bg-[#131722]">
      <FloatingFlags />

      <div className="absolute inset-0 z-0">
        <img
          src="/images/trading_hero_bg.png"
          alt="Deploy capital with me and unlock a $200 USDT allocation! 🚀"
          className="w-full h-full object-cover opacity-25 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1e222d] via-transparent to-[#131722]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
          <span className="w-1.5 h-1.5 bg-[#f01a64] rounded-full animate-ping"></span>
          <span className="text-[8px] md:text-[10px] font-black text-white uppercase tracking-[0.3em]">SECURE CLUSTER ACTIVE</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent leading-[0.95] uppercase italic px-2">
          DEPLOY CAPITAL,<br className="hidden sm:block" /> HARVEST YIELDS.
        </h1>

        <div className="grid grid-cols-2 md:flex md:flex-wrap justify-center gap-2 md:gap-4 max-w-5xl mx-auto mb-8 px-2">
          {[
            "Automated Alpha Generation",
            "Daily USDT Settlements",
            "On-Chain Transparency",
            "Institutional Grade Security",
            "Quant Research Terminal"
          ].map((benefit, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-[#1e222d]/80 border border-[#2a2e39] px-3 py-2 rounded-xl shadow-lg backdrop-blur-sm">
              <svg className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#00b36b] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-[8px] md:text-[10px] font-black text-gray-200 uppercase tracking-widest text-left leading-tight">{benefit}</span>
            </div>
          ))}
        </div>

        <p className="max-w-3xl mx-auto text-sm md:text-xl text-gray-300 mb-10 px-6 font-bold leading-relaxed tracking-wide drop-shadow-lg">
          Achieve sovereign wealth. Mirror institutional-grade strategies and generate passive <span className="text-[#f01a64] uppercase font-black text-base md:text-2xl border-b-2 border-[#f01a64]">USDT Yield Daily.</span>
        </p>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 px-4">

          {/* ELITE LIVE CLASSES BANNER */}
          <div
            onClick={() => {
              if (!hasDeposited) {
                alert("First deposit then you will clear for your Google Meet Classes");
                return;
              }
              externalShowMentorship?.();
            }}
            className="w-full lg:w-auto min-w-0 md:min-w-[340px] bg-gradient-to-r from-[#1e222d] via-[#2a2e39] to-[#1e222d] border border-white/10 rounded-2xl p-5 flex items-center justify-between cursor-pointer group hover:border-[#00b36b]/40 transition-all shadow-2xl relative overflow-hidden active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none opacity-50 group-hover:animate-pulse"></div>

            <div className="flex items-center gap-3 md:gap-4 shrink-0">
              <div className="bg-[#131722] p-2 md:p-2.5 rounded-2xl border border-white/10 flex flex-col items-center">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-[#00b36b] mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18" />
                </svg>
                <img src="https://upload.wikimedia.org/wikipedia/commons/9/9b/Google_Meet_icon_%282020%29.svg" alt="Meet" className="w-3 h-3 md:w-4 md:h-4" />
              </div>
              <div className="text-left">
                <span className="block text-[6px] md:text-[7px] text-[#00b36b] font-black uppercase tracking-[0.3em]">Institutional</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] md:text-[10px] font-black text-white tracking-widest uppercase">Live Class</span>
                  <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-[#00b36b] rounded-full animate-pulse shadow-[0_0_8px_#00b36b]"></div>
                </div>
              </div>
            </div>

            <div className="px-3 text-center flex-1">
              <h4 className="text-white font-black text-[10px] md:text-[11px] uppercase tracking-tight leading-tight mb-2">
                Live Market &<br />Google Meet Classes
              </h4>
              <div className="bg-[#00b36b] text-white px-6 py-2 rounded-lg font-black text-[9px] md:text-[10px] uppercase tracking-widest inline-block shadow-lg border border-white/20 transition-all group-hover:bg-[#00d68f]">
                Click Now
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <button
              onClick={onStartJourney || onJoinClick}
              className="group w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-[#f01a64] to-pink-600 hover:from-pink-600 hover:to-[#f01a64] text-white font-black text-sm md:text-base rounded-2xl shadow-[0_10px_30px_rgba(240,26,100,0.3)] hover:shadow-[0_15px_40px_rgba(240,26,100,0.5)] transform transition-all duration-300 active:scale-95 uppercase tracking-tighter border border-white/10 relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                START EARNING USDT
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>

            <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
              <button
                onClick={onShareClick}
                className="group w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-[#0088cc] to-[#0077b5] hover:from-[#0077b5] hover:to-[#006699] text-white font-black text-sm md:text-base rounded-2xl shadow-[0_10px_30px_rgba(0,136,204,0.3)] hover:shadow-[0_15px_40px_rgba(0,136,204,0.5)] transform transition-all duration-300 active:scale-95 uppercase tracking-tighter flex items-center justify-center gap-2 border border-white/10 relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="h-5 w-5 text-white group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.891 8.146l-2.003 9.442c-.149.659-.537.818-1.089.508l-3.048-2.247-1.47 1.415c-.162.162-.299.3-.612.3l.219-3.106 5.651-5.108c.245-.219-.054-.341-.379-.126l-6.985 4.4-3.007-.941c-.654-.203-.667-.654.137-.967l11.75-4.529c.544-.203 1.02.123.836.761z" />
                  </svg>
                  <span className="whitespace-nowrap uppercase tracking-widest">Share & Earn $200</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </button>

              {/* Referral Info Caption */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2 w-full sm:w-auto">
                <p className="text-center text-[10px] md:text-xs font-bold text-gray-300 leading-relaxed">
                  <span className="text-white font-black">👥 Refer 3 friends</span>
                  <span className="mx-1 text-white/40">•</span>
                  <span className="text-[#00b36b] font-black">💰 Earn $200</span>
                  <span className="block text-[9px] md:text-[10px] mt-0.5 text-gray-400 font-semibold">on their first successful deposit</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;