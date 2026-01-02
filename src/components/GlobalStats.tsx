
import React, { useState, useEffect } from 'react';

const GlobalStats: React.FC = () => {
    const [activeTraders, setActiveTraders] = useState(18420);
    const [marketLiquidity, setMarketLiquidity] = useState(45230000);
    const [accuracy, setAccuracy] = useState(98.4);

    // Odometer Effect Helper
    const animateValue = (start: number, end: number, duration: number, setter: (val: number) => void) => {
        const startTime = performance.now();
        const update = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out quart
            const ease = 1 - Math.pow(1 - progress, 4);

            const current = start + (end - start) * ease;
            setter(current);

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        requestAnimationFrame(update);
    };

    useEffect(() => {
        // Active Traders Fast Fluctuation (Odometer feel)
        const traderInterval = setInterval(() => {
            setActiveTraders(prev => {
                const change = Math.floor(Math.random() * 150) - 50; // Bigger jumps for odometer feel
                let next = prev + change;
                if (next < 12000) next = 12000 + Math.random() * 500;
                if (next > 25000) next = 25000 - Math.random() * 500;

                // Trigger smooth animation to new value? 
                // React state updates are instant, so for true "rolling" we might need a custom hook or just fast updates.
                // For this component, we'll stick to frequent updates for "Busy" feel.
                return next;
            });
        }, 800); // Faster updates (800ms)

        // Liquidity Fluctuation ($45M+)
        const liquidityInterval = setInterval(() => {
            setMarketLiquidity(prev => {
                const change = Math.floor(Math.random() * 150000) - 50000;
                let next = prev + change;
                if (next < 45000000) next = 45000000 + Math.random() * 100000;
                return next;
            });
        }, 1200);

        // Accuracy Fluctuation (98% - 99%)
        const accuracyInterval = setInterval(() => {
            setAccuracy(prev => {
                const change = (Math.random() * 0.2) - 0.1;
                let next = prev + change;
                if (next < 98.0) next = 98.0 + Math.random() * 0.1;
                if (next > 99.0) next = 99.0 - Math.random() * 0.1;
                return next;
            });
        }, 3000);

        return () => {
            clearInterval(traderInterval);
            clearInterval(liquidityInterval);
            clearInterval(accuracyInterval);
        };
    }, []);

    // Formatter for 'Odometer' look (Monospace numbers)
    const formatOdometer = (num: number) => {
        return Math.floor(num).toLocaleString();
    };

    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-8">
            {/* Active Traders */}
            <div className="bg-[#1e222d] border border-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl flex items-center justify-between group hover:border-[#f01a64]/30 transition-colors relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 md:p-4 opacity-10 group-hover:opacity-20 transition">
                    <div className="w-12 md:w-16 h-12 md:h-16 bg-[#f01a64] blur-xl md:blur-2xl rounded-full"></div>
                </div>
                <div>
                    <h4 className="text-[8px] md:text-[10px] text-gray-500 uppercase font-black tracking-widest mb-0.5 md:mb-1">Active</h4>
                    <div className="text-lg md:text-2xl font-black text-white flex items-end gap-1 md:gap-2 font-mono tracking-tight">
                        {formatOdometer(activeTraders)}
                    </div>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-[#f01a64]/10 rounded-lg md:rounded-xl flex items-center justify-center text-[#f01a64] relative z-10">
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
            </div>

            {/* Market Liquidity */}
            <div className="bg-[#1e222d] border border-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl flex items-center justify-between group hover:border-blue-500/30 transition-colors relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 md:p-4 opacity-10 group-hover:opacity-20 transition">
                    <div className="w-12 md:w-16 h-12 md:h-16 bg-blue-500 blur-xl md:blur-2xl rounded-full"></div>
                </div>
                <div>
                    <h4 className="text-[8px] md:text-[10px] text-gray-500 uppercase font-black tracking-widest mb-0.5 md:mb-1">Liquidity</h4>
                    <div className="text-lg md:text-2xl font-black text-white font-mono tracking-tight">
                        ${(marketLiquidity / 1000000).toFixed(1)}M
                    </div>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-500/10 rounded-lg md:rounded-xl flex items-center justify-center text-blue-500 relative z-10">
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
            </div>

            {/* Trade Accuracy (Spans 2 columns on tiny mobile) */}
            <div className="col-span-2 lg:col-span-1 bg-[#1e222d] border border-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl flex items-center justify-between group hover:border-[#00b36b]/30 transition-colors relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 md:p-4 opacity-10 group-hover:opacity-20 transition">
                    <div className="w-12 md:w-16 h-12 md:h-16 bg-[#00b36b] blur-xl md:blur-2xl rounded-full"></div>
                </div>
                <div>
                    <h4 className="text-[8px] md:text-[10px] text-gray-500 uppercase font-black tracking-widest mb-0.5 md:mb-1">AI Accuracy</h4>
                    <div className="text-lg md:text-2xl font-black text-[#00b36b] font-mono tracking-tight">
                        {accuracy.toFixed(1)}%
                    </div>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-[#00b36b]/10 rounded-lg md:rounded-xl flex items-center justify-center text-[#00b36b] relative z-10">
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
            </div>
        </div>
    );
};

export default GlobalStats;
