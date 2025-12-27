import React, { useState, useEffect } from 'react';
import { Trader } from '../types';

interface TraderProfileModalProps {
  trader: Trader;
  currentProfit?: number;
  currentWinRate?: number;
  onClose: () => void;
  onCopyClick: () => void;
}

const useCountUp = (endValue: number, duration: number = 1000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = endValue / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= endValue) {
        setCount(endValue);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [endValue]);
  return count;
};

const TraderProfileModal: React.FC<TraderProfileModalProps> = ({ trader, currentProfit, currentWinRate, onClose, onCopyClick }) => {
  const [isScanning, setIsScanning] = useState(true);
  const [scanStep, setScanStep] = useState(0);
  const [showDeployConfig, setShowDeployConfig] = useState(false);
  const [investAmount, setInvestAmount] = useState<number>(1000);

  const animatedRoi = useCountUp(trader.roi);

  useEffect(() => {
    const steps = [
      "Connecting to Market Channel...",
      "Verifying Blockchain History...",
      "Analyzing Portfolio Protocols...",
      "Syncing Live PnL..."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setScanStep(currentStep);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsScanning(false);
      }
    }, 350);

    return () => clearInterval(interval);
  }, [trader]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInvestAmount(Number(e.target.value));
  };

  const projectedProfit = (investAmount * (trader.roi / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 });

  if (isScanning) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#131722]/95 backdrop-blur-xl p-6">
        <div className="text-center space-y-6 max-w-xs w-full">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-4 border-[#2a2e39] rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-[#f01a64] rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-black text-white">{Math.floor(Math.random() * 99)}%</span>
            </div>
          </div>
          <div>
            <h3 className="text-white font-black uppercase tracking-widest text-base md:text-lg animate-pulse">Analyzing Performance Data</h3>
            <p className="text-[#00b36b] font-mono text-[10px] mt-2 uppercase tracking-widest">
              {["Connecting...", "Verifying History...", "Checking Liquidity...", "Syncing..."][scanStep] || "Finalizing Protocols..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const displayWinRate = currentWinRate ? currentWinRate.toFixed(1) : trader.winRate;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-0 sm:p-4">
      <div className="bg-[#131722] w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-4xl sm:rounded-[2.5rem] flex flex-col overflow-hidden animate-in zoom-in-95 shadow-2xl border border-white/5">

        <div className="p-6 md:p-8 border-b border-[#2a2e39] bg-gradient-to-r from-[#1e222d] to-[#131722] shrink-0 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 p-2 hover:text-white transition-colors bg-white/5 rounded-full z-10 active:scale-90">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="relative shrink-0">
              <img src={trader.avatar} className="w-16 h-16 md:w-24 md:h-24 rounded-2xl object-cover ring-2 ring-[#f01a64]/50 shadow-[0_0_20px_rgba(240,26,100,0.3)]" />
              <div className="absolute -bottom-1 -right-1 bg-[#00b36b] text-[8px] font-black text-white px-2 py-0.5 rounded-full border border-[#131722] animate-pulse">
                LIVE
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl md:text-3xl font-black text-white uppercase tracking-tighter truncate leading-none mb-1">{trader.name}</h2>
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest block mb-2 italic truncate">ID: {trader.copyTradeId}</span>
              <div className="flex flex-wrap gap-2">
                <span className="text-[8px] md:text-[9px] font-black bg-white/10 text-white px-2 py-0.5 rounded uppercase tracking-widest">{trader.specialization || trader.type}</span>
                <span className="text-[8px] md:text-[9px] font-black bg-[#f01a64]/10 text-[#f01a64] px-2 py-0.5 rounded uppercase tracking-widest">Risk: {trader.riskScore}/10</span>
                {trader.rank && (
                  <span className="text-[8px] md:text-[9px] font-black bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded uppercase tracking-widest border border-yellow-500/20">{trader.rank}</span>
                )}
                {trader.country && (
                  <span className="text-[10px] md:text-[11px] bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    {trader.country === 'USA' ? '🇺🇸' : trader.country === 'Pakistan' ? '🇵🇰' : trader.country === 'UAE' ? '🇦🇪' : trader.country === 'Nigeria' ? '🇳🇬' : trader.country === 'UK' ? '🇬🇧' : trader.country === 'Austria' ? '🇦🇹' : trader.country === 'Australia' ? '🇦🇺' : trader.country === 'India' ? '🇮🇳' : trader.country}
                  </span>
                )}
                {trader.verificationStatus && (
                  <span className="text-[8px] md:text-[9px] font-black bg-[#00b36b]/10 text-[#00b36b] px-2 py-0.5 rounded uppercase tracking-widest border border-[#00b36b]/20 flex items-center gap-1">
                    {trader.verificationStatus}
                  </span>
                )}
                {trader.performanceBadge && (
                  <span className="text-[8px] md:text-[9px] font-black bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded uppercase tracking-widest border border-blue-500/20 flex items-center gap-1">
                    {trader.performanceBadge}
                  </span>
                )}
              </div>
              {trader.socials && (trader.socials.instagram || trader.socials.telegram || trader.socials.twitter || trader.socials.youtube) && (
                <div className="flex gap-3 mt-3">
                  {trader.socials.instagram && (
                    <a href={trader.socials.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-[#f01a64] transition-colors group">
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.054-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.163 6.163 6.162-2.759 6.162-6.163-2.759 6.162-6.162-6.162z" /></svg>
                    </a>
                  )}
                  {trader.socials.telegram && (
                    <a href={trader.socials.telegram} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-[#0088cc] transition-colors group">
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                    </a>
                  )}
                  {trader.socials.twitter && (
                    <a href={trader.socials.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-black transition-colors group">
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                    </a>
                  )}
                  {trader.socials.youtube && (
                    <a href={trader.socials.youtube} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-red-600 transition-colors group">
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar bg-[#131722]">
          <div className="p-6 md:p-8 space-y-6 md:space-y-8">
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              <div className="bg-[#1e222d] p-3 md:p-4 rounded-2xl border border-[#2a2e39] text-center">
                <span className="text-[7px] md:text-[8px] text-gray-500 uppercase font-black block mb-1">Return</span>
                <span className="text-base md:text-2xl font-black text-[#00b36b]">+{animatedRoi.toFixed(0)}%</span>
              </div>
              <div className="bg-[#1e222d] p-3 md:p-4 rounded-2xl border border-[#2a2e39] text-center">
                <span className="text-[7px] md:text-[8px] text-gray-500 uppercase font-black block mb-1">Win Rate</span>
                <span className="text-base md:text-2xl font-black text-white">{displayWinRate}%</span>
              </div>
              <div className="bg-[#1e222d] p-3 md:p-4 rounded-2xl border border-[#2a2e39] text-center">
                <span className="text-[7px] md:text-[8px] text-gray-500 uppercase font-black block mb-1">Followers</span>
                <span className="text-base md:text-2xl font-black text-blue-500">{(trader.followers / 1000).toFixed(0)}k</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#1e222d] to-black p-5 md:p-6 rounded-[2rem] border border-white/10 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#f01a64]/10 rounded-full blur-3xl"></div>
              <h4 className="text-[8px] md:text-[9px] text-[#f01a64] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                Market Edge Analysis
              </h4>
              <p className="text-gray-300 text-[10px] md:text-xs font-medium italic leading-relaxed relative z-10 first-letter:text-xl md:first-letter:text-2xl first-letter:font-black first-letter:text-[#f01a64] first-letter:mr-1 first-letter:float-left">
                {trader.bio}
              </p>
            </div>

            {trader.usdtAddress && (
              <div className="bg-[#1e222d] p-5 rounded-2xl border border-[#2a2e39] relative overflow-hidden group">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-[9px] md:text-[10px] text-gray-500 font-black uppercase tracking-widest">Active Trading Node</h4>
                  <span className="text-[8px] md:text-[9px] text-[#f01a64] font-black uppercase">Verified TRC20</span>
                </div>
                <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-white font-mono truncate">{trader.usdtAddress}</div>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(trader.usdtAddress!);
                    }}
                    className="shrink-0 text-[10px] font-black text-[#f01a64] hover:text-white uppercase transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}

            <div className="bg-[#1e222d] rounded-2xl border border-[#2a2e39] p-5 relative overflow-hidden group">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-[9px] md:text-[10px] text-gray-400 font-black uppercase tracking-widest">Growth Analytics</h4>
                <span className="text-[8px] md:text-[9px] text-[#00b36b] bg-[#00b36b]/10 px-2 py-0.5 rounded font-black uppercase">Institutional</span>
              </div>
              <div className="h-24 md:h-32 w-full relative">
                <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00b36b" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#00b36b" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0 35 C 10 35, 15 30, 25 28 S 40 32, 50 20 S 65 15, 80 10 S 90 5, 100 2" fill="none" stroke="#00b36b" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  <path d="M0 35 C 10 35, 15 30, 25 28 S 40 32, 50 20 S 65 15, 80 10 S 90 5, 100 2 V 40 H 0 Z" fill="url(#chartFill)" stroke="none" />
                </svg>
                <div className="absolute top-0 right-0 h-full w-[1px] bg-white/10"></div>
                <div className="absolute top-2 right-0 translate-x-1/2 w-2 h-2 bg-[#00b36b] rounded-full shadow-[0_0_10px_#00b36b]"></div>
              </div>
            </div>

            <div>
              <h4 className="text-[9px] md:text-[10px] text-gray-500 font-black uppercase tracking-widest mb-3 border-l-2 border-[#f01a64] pl-3">Recent Trade History</h4>
              <div className="space-y-2">
                {(() => {
                  const markets = trader.markets || ['Crypto'];
                  const getPair = (idx: number) => {
                    const m = markets[idx % markets.length].toLowerCase();
                    if (m === 'forex') return ['EUR/USD', 'GBP/JPY', 'USD/JPY'][idx % 3];
                    if (m === 'gold') return 'XAU/USD';
                    if (m === 'stocks') return ['AAPL', 'TSLA', 'NVDA'][idx % 3];
                    return ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'][idx % 3];
                  };

                  return [
                    { pair: getPair(0), type: 'LONG', pnl: '+12.5%', time: '2m ago' },
                    { pair: getPair(1), type: 'SHORT', pnl: '+5.2%', time: '15m ago' },
                    { pair: getPair(2), type: 'LONG', pnl: '+8.1%', time: '1h ago' },
                  ].map((t, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#1e222d] p-3 md:p-4 rounded-xl border border-white/5 hover:bg-[#252a36] transition-colors">
                      <div className="flex items-center gap-3">
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${t.type === 'LONG' ? 'bg-[#00b36b]/20 text-[#00b36b]' : 'bg-red-500/20 text-red-500'}`}>{t.type}</span>
                        <span className="text-xs font-bold text-white">{t.pair}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-xs font-black text-[#00b36b]">{t.pnl}</span>
                        <span className="block text-[8px] text-gray-600 font-medium">{t.time}</span>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1e222d] border-t border-[#2a2e39] p-6 md:p-8 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20 pb-[calc(2rem+env(safe-area-inset-bottom))]">
          {!showDeployConfig ? (
            <div className="flex gap-3">
              {trader.youtubeLink && (
                <button
                  onClick={() => window.open(trader.youtubeLink, '_blank')}
                  className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 py-4 rounded-xl font-black text-white text-[9px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Strategy
                </button>
              )}
              <button
                onClick={() => setShowDeployConfig(true)}
                className="flex-[2] bg-[#f01a64] hover:bg-pink-700 py-4 rounded-xl font-black text-white text-xs uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(240,26,100,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2 border border-white/10"
              >
                Copy Protocol
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in">
              <div className="flex justify-between items-center">
                <span className="text-[9px] md:text-[10px] text-gray-500 font-black uppercase tracking-widest">Mirror Amount (USDT)</span>
                <span className="text-lg md:text-xl font-black text-white">${investAmount.toLocaleString()}</span>
              </div>

              <input
                type="range"
                min="100"
                max="50000"
                step="100"
                value={investAmount}
                onChange={handleSliderChange}
                className="w-full h-2 bg-[#131722] rounded-lg appearance-none cursor-pointer accent-[#00b36b]"
              />

              <div className="bg-black/40 p-4 rounded-xl border border-[#00b36b]/30 flex justify-between items-center">
                <span className="text-[8px] md:text-[9px] text-[#00b36b] font-black uppercase tracking-widest">Target Return</span>
                <span className="text-sm md:text-base font-black text-[#00b36b]">+${projectedProfit}</span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeployConfig(false)}
                  className="flex-1 py-4 rounded-xl font-black text-gray-500 bg-black/20 hover:bg-black/40 text-[10px] uppercase tracking-widest transition-colors active:scale-95"
                >
                  Back
                </button>
                <button
                  onClick={() => { onClose(); onCopyClick(); }}
                  className="flex-[2] bg-[#00b36b] hover:bg-green-600 py-4 rounded-xl font-black text-white text-xs uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(0,179,107,0.4)] active:scale-95 transition-all border border-white/10"
                >
                  Confirm Copy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TraderProfileModal;