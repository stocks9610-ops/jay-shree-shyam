
import React, { useState, useEffect } from 'react';

const TickerTape: React.FC = () => {
  const [stats, setStats] = useState({
    liquidity: 142000000,
    activeNodes: 45216,
    accuracy: 98.4,
    btcPrice: 42560,
    ethPrice: 2240,
    status: "SYSTEM: OPTIMAL (12ms)",
    statusColor: "text-[#00b36b]"
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => {
        // Liquidity: 88M - 289M
        let newLiquidity = prev.liquidity + (Math.random() * 500000 - 250000);
        if (newLiquidity < 88000000) newLiquidity = 88000000 + Math.random() * 1000000;
        if (newLiquidity > 289000000) newLiquidity = 289000000 - Math.random() * 1000000;

        // Traders
        let newTraders = prev.activeNodes + Math.floor(Math.random() * 7 - 3);
        if (newTraders < 10200) newTraders = 10200 + Math.floor(Math.random() * 10);

        // Accuracy
        let newAccuracy = prev.accuracy + (Math.random() * 0.4 - 0.2);
        if (newAccuracy < 91.5) newAccuracy = 91.5 + Math.random() * 0.5;
        if (newAccuracy > 99.2) newAccuracy = 99.2 - Math.random() * 0.5;

        // Prices
        let newBtc = prev.btcPrice + (Math.random() * 50 - 25);
        let newEth = prev.ethPrice + (Math.random() * 10 - 5);

        // Status Logic
        let newStatus = prev.status;
        let newStatusColor = prev.statusColor;
        const r = Math.random();

        if (r > 0.98) {
          newStatus = "REROUTING NODES...";
          newStatusColor = "text-amber-500 animate-pulse";
        } else if (r > 0.95) {
          newStatus = "SYNCING LEDGER...";
          newStatusColor = "text-blue-500 animate-pulse";
        } else if (prev.status !== "SYSTEM: OPTIMAL (12ms)" && r > 0.7) {
          const latency = Math.floor(Math.random() * 20) + 8;
          newStatus = `SYSTEM: OPTIMAL (${latency}ms)`;
          newStatusColor = "text-[#00b36b]";
        }

        return {
          liquidity: newLiquidity,
          activeNodes: newTraders,
          accuracy: newAccuracy,
          btcPrice: newBtc,
          ethPrice: newEth,
          status: newStatus,
          statusColor: newStatusColor
        };
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#1e222d] border-b border-[#2a2e39] py-2 px-4 md:px-10 overflow-hidden relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 whitespace-nowrap overflow-x-auto no-scrollbar">

        {/* MARKET LIQUIDITY */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-1.5 h-1.5 bg-[#00b36b] rounded-full animate-pulse shadow-[0_0_8px_#00b36b]"></div>
          <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
            LIQUIDITY
            <span className="text-white">${(stats.liquidity / 1000000).toFixed(1)}M</span>
            <span className="text-[#00b36b] flex items-center">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              2.4%
            </span>
          </span>
        </div>

        {/* BTC PRICE */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
            BTC/USD
            <span className="text-white">${stats.btcPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            <span className={stats.btcPrice > 42560 ? "text-[#00b36b] flex items-center" : "text-red-500 flex items-center"}>
              {stats.btcPrice > 42560 ? (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              ) : (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
              )}
            </span>
          </span>
        </div>

        {/* ACTIVE TRADERS */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-1.5 h-1.5 bg-[#f01a64] rounded-full animate-pulse shadow-[0_0_8px_#f01a64]"></div>
          <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">
            ACTIVE TRADERS: <span className="text-white">{stats.activeNodes.toLocaleString()}</span>
          </span>
        </div>

        {/* TRADE ACCURACY */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_#3b82f6]"></div>
          <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">
            ACCURACY: <span className="text-white">{stats.accuracy.toFixed(1)}%</span>
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <span className={`text-[8px] font-black uppercase tracking-[0.3em] border border-white/5 px-2 py-0.5 rounded ${stats.statusColor}`}>
            {stats.status}
          </span>
        </div>

      </div>
    </div>
  );
};

export default TickerTape;
