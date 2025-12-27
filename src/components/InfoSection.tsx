
import React from 'react';

const InfoSection: React.FC = () => {
  return (
    <section className="bg-[#131722] text-gray-300 py-20 border-t border-[#2a2e39] relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#f01a64_1px,transparent_1px)] [background-size:40px_40px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 space-y-24 relative z-10">

        {/* --- SECTION 1: AGGRESSIVE REAL-WORLD HEADER --- */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-4 bg-[#1e222d] px-8 py-4 rounded-full border border-[#f01a64]/30 shadow-[0_0_30px_rgba(240,26,100,0.1)]">
             <span className="text-white font-black text-[10px] uppercase tracking-[0.3em]">Live Market Trading Hub</span>
             <span className="text-[#f01a64] text-xs font-black">|</span>
             <div className="text-[#00b36b] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
               <span className="w-2 h-2 bg-[#00b36b] rounded-full animate-ping"></span>
               98.4% Accuracy Verified
             </div>
          </div>
          <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter italic leading-none">
            The World's Most <span className="text-[#f01a64]">Aggressive</span> Wealth Engine
          </h2>
          <p className="max-w-3xl mx-auto text-gray-500 text-sm md:text-lg font-bold uppercase tracking-wide leading-relaxed">
            Eliminate guesswork. Deploy capital alongside the world's most consistent traders with <span className="text-white">zero psychological bias</span> and guaranteed execution precision.
          </p>
        </div>

        {/* --- SECTION 2: 6-STEP REAL-WORLD WEALTH FLOW --- */}
        <div className="space-y-12">
           <div className="text-center">
              <h3 className="text-[10px] text-[#f01a64] font-black uppercase tracking-[0.5em] mb-4">Real-World Wealth Roadmap</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-6 gap-4 relative">
             {[
               { step: "01", title: "Join & Register", desc: "Open Your Trading Account", icon: "👤" },
               { step: "02", title: "Select Leader", desc: "Choose a 98% Accuracy Trader", icon: "📊" },
               { step: "03", title: "Deposit USDT", desc: "Fund Your Real-Time Wallet", icon: "💰" },
               { step: "04", title: "Passive Earn", desc: "Start Earning Risk-Free", icon: "🛡️" },
               { step: "05", title: "Watch Grow", desc: "See Your Money Multiply", icon: "📈" },
               { step: "06", title: "Quick Withdraw", desc: "Instant Payout To Your Wallet", icon: "💎" }
             ].map((item, idx, arr) => (
               <div key={idx} className="relative group">
                 <div className="bg-[#1e222d] p-6 rounded-[2rem] border border-[#2a2e39] text-center h-full flex flex-col items-center justify-center transition-all hover:border-[#f01a64]/40">
                   <div className="text-2xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
                   <div className="w-8 h-8 bg-[#131722] rounded-full border border-white/5 flex items-center justify-center text-[#f01a64] font-black text-[10px] mb-3 shadow-inner">
                     {item.step}
                   </div>
                   <h4 className="text-white font-black uppercase text-xs mb-1 tracking-tight">{item.title}</h4>
                   <p className="text-[9px] text-gray-500 font-black uppercase tracking-tighter leading-tight">{item.desc}</p>
                 </div>
                 
                 {/* Arrow Flow Indicator */}
                 {idx < arr.length - 1 && (
                   <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 text-[#f01a64] opacity-30">
                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                       <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                     </svg>
                   </div>
                 )}
               </div>
             ))}
           </div>
        </div>

        {/* --- SECTION 3: REAL-WORLD TRADING BENCHMARK --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
          
          <div className="bg-[#1e222d] p-10 md:p-14 rounded-[3rem] border border-white/5 relative overflow-hidden flex flex-col justify-center">
             <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#f01a64]/5 rounded-full blur-[100px]"></div>
             <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-8">Real Trading Advantage</h3>
             <div className="space-y-10">
               <div className="flex gap-6">
                 <div className="w-1.5 bg-gray-800 rounded-full h-auto"></div>
                 <div className="space-y-2">
                   <h5 className="text-gray-500 font-black text-[10px] uppercase tracking-widest">Manual Trading Errors</h5>
                   <p className="text-sm text-gray-600 font-medium leading-relaxed">Prone to fear and greed, 95% of retail traders lose. Requires constant screen time and stress.</p>
                 </div>
               </div>
               <div className="flex gap-6">
                 <div className="w-1.5 bg-[#00b36b] rounded-full shadow-[0_0_15px_#00b36b] h-auto"></div>
                 <div className="space-y-2">
                   <h5 className="text-white font-black text-[10px] uppercase tracking-widest">Global Copy-Trade Engine</h5>
                   <p className="text-sm text-gray-300 font-medium leading-relaxed">Passive, professional execution. Mirror the exact moves of traders with a <span className="text-[#00b36b] font-black">98.4% Sure-Win Rate</span>. Immediate market profit settlement.</p>
                 </div>
               </div>
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             {[
               { title: "Maximum Profit", desc: "Mirror real market positions with aggressive 100x leverage." },
               { title: "Zero Lag", desc: "Your trades execute instantly the moment a leader opens a position." },
               { title: "Sure-Win Growth", desc: "Capital is managed by experts to ensure a 98% success rate." },
               { title: "Immediate Payout", desc: "Profit is ready for withdrawal to your wallet as soon as the trade closes." }
             ].map((feat, i) => (
               <div key={i} className="bg-[#1e222d]/40 p-8 rounded-[2rem] border border-white/5 flex flex-col justify-center group hover:bg-[#1e222d] transition-all">
                 <h4 className="text-white font-black text-xs uppercase tracking-tight mb-3 group-hover:text-[#f01a64] transition-colors">{feat.title}</h4>
                 <p className="text-[10px] text-gray-500 font-bold leading-relaxed uppercase tracking-tighter">{feat.desc}</p>
               </div>
             ))}
          </div>
        </div>

        {/* --- SECTION 4: FINAL CALL TO ACTION --- */}
        <div className="pt-20 border-t border-white/5 text-center space-y-10">
           <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-[9px] uppercase tracking-[0.4em] text-gray-600 font-black">
              {['Live Markets', 'Success Hall', 'Trade Analytics', 'Network Status', 'Verified Payouts'].map((link) => (
                <span key={link} className="hover:text-white transition-colors cursor-default">{link}</span>
              ))}
           </div>
           
           <div className="max-w-xl mx-auto space-y-6">
              <p className="text-[11px] text-gray-500 font-black uppercase tracking-widest leading-relaxed">
                Initialize your account and start trading with 98% accuracy for sure-win results.
              </p>
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="bg-[#00b36b] hover:bg-green-600 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_10px_40px_rgba(0,179,107,0.3)] transition-all active:scale-95"
              >
                Access Real Trading Hub
              </button>
           </div>
        </div>

      </div>
    </section>
  );
};

export default InfoSection;
