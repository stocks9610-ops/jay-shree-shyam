
import React, { useState, useEffect } from 'react';

const GlobalStats: React.FC = () => {
    const [activeTraders, setActiveTraders] = useState(18420);
    const [marketLiquidity, setMarketLiquidity] = useState(45230000);
    const [accuracy, setAccuracy] = useState(98.4);

    useEffect(() => {
        // Active Traders Fluctuation (12k - 25k)
        const traderInterval = setInterval(() => {
            setActiveTraders(prev => {
                const change = Math.floor(Math.random() * 50) - 20; // -20 to +30 change
                let next = prev + change;
                if (next < 12000) next = 12000 + Math.random() * 500;
                if (next > 25000) next = 25000 - Math.random() * 500;
                return next;
            });
        }, 2000); // Every 2s

        // Liquidity Fluctuation ($45M+)
        const liquidityInterval = setInterval(() => {
            setMarketLiquidity(prev => {
                const change = Math.floor(Math.random() * 50000) - 20000; // Fluctuations
                let next = prev + change;
                if (next < 45000000) next = 45000000 + Math.random() * 100000;
                return next;
            });
        }, 3500); // Every 3.5s

        // Accuracy Fluctuation (98% - 99%)
        const accuracyInterval = setInterval(() => {
            setAccuracy(prev => {
                const change = (Math.random() * 0.1) - 0.05; // Tiny fluctuations
                let next = prev + change;
                if (next < 98.0) next = 98.0 + Math.random() * 0.1;
                if (next > 99.0) next = 99.0 - Math.random() * 0.1;
                return next;
            });
        }, 5000); // Every 5s

        return () => {
            clearInterval(traderInterval);
            clearInterval(liquidityInterval);
            clearInterval(accuracyInterval);
        };
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Active Traders */}
            <div className="bg-[#1e222d] border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-[#f01a64]/30 transition-colors">
                <div>
                    <h4 className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Active Traders</h4>
                    <div className="text-2xl font-black text-white flex items-end gap-2">
                        {activeTraders.toLocaleString()}
                        <span className="flex items-center text-[10px] text-[#00b36b] font-bold mb-1">
                            <span className="w-1.5 h-1.5 bg-[#00b36b] rounded-full animate-pulse mr-1"></span>
                            Online
                        </span>
                    </div>
                </div>
                <div className="w-10 h-10 bg-[#f01a64]/10 rounded-xl flex items-center justify-center text-[#f01a64]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
            </div>

            {/* Market Liquidity */}
            <div className="bg-[#1e222d] border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-blue-500/30 transition-colors">
                <div>
                    <h4 className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Market Liquidity</h4>
                    <div className="text-2xl font-black text-white">
                        ${(marketLiquidity / 1000000).toFixed(2)}M
                    </div>
                </div>
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
            </div>

            {/* Trade Accuracy */}
            <div className="bg-[#1e222d] border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-[#00b36b]/30 transition-colors">
                <div>
                    <h4 className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">AI Trade Accuracy</h4>
                    <div className="text-2xl font-black text-white text-[#00b36b]">
                        {accuracy.toFixed(1)}%
                    </div>
                </div>
                <div className="w-10 h-10 bg-[#00b36b]/10 rounded-xl flex items-center justify-center text-[#00b36b]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
            </div>
        </div>
    );
};

export default GlobalStats;
