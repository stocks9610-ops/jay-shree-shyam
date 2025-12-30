import React, { useState, useEffect } from 'react';
import { Strategy, ActiveTrade } from '../types';

interface TradingHubProps {
    activeTrade?: ActiveTrade;
    traderName?: string | null;
}

const TradingHub: React.FC<TradingHubProps> = ({ activeTrade, traderName }) => {
    const [sentiment, setSentiment] = useState(65); // Default Bullish 65%
    const [volatility, setVolatility] = useState('Low');

    useEffect(() => {
        const interval = setInterval(() => {
            setSentiment(prev => {
                const change = Math.random() * 2 - 1;
                return Math.min(95, Math.max(5, prev + change));
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    if (activeTrade) {
        return (
            <div className="bg-[#1e222d] border-2 border-[#f01a64]/30 rounded-3xl p-6 relative overflow-hidden animate-in fade-in zoom-in duration-500">
                <div className="absolute top-0 right-0 p-3">
                    <div className="flex items-center gap-1 bg-[#f01a64]/10 px-2 py-1 rounded-full border border-[#f01a64]/20">
                        <div className="w-1.5 h-1.5 bg-[#f01a64] rounded-full animate-ping"></div>
                        <span className="text-[8px] text-[#f01a64] font-black uppercase tracking-tighter">Live Sync</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#f01a64] to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <div>
                            <h3 className="text-white font-black text-xs uppercase tracking-widest">Active Mirroring</h3>
                            <p className="text-gray-500 text-[10px] uppercase font-bold">{traderName || 'Pro Trader'} Cluster</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                            <p className="text-gray-500 text-[8px] uppercase font-black mb-1">Asset Staked</p>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white">₿</div>
                                <span className="text-white font-black text-xs">BTC/USDT</span>
                            </div>
                        </div>
                        <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                            <p className="text-gray-500 text-[8px] uppercase font-black mb-1">Mirror Size</p>
                            <span className="text-white font-black text-xs">${activeTrade.investAmount.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="pt-2">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Handshake Integrity</span>
                            <span className="text-[8px] text-[#00b36b] font-black">98.4%</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#f01a64] to-purple-600 animate-[progress_2s_ease-in-out_infinite]" style={{ width: '98%' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#1e222d] border border-white/5 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group min-h-[180px]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00b36b]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-white font-black uppercase text-[10px] tracking-widest">AI Market Sentiment</h3>
                        <p className="text-gray-500 text-[8px] uppercase font-bold">Hybrid Intel Analysis</p>
                    </div>
                    <div className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${sentiment > 50 ? 'bg-[#00b36b]/10 text-[#00b36b]' : 'bg-[#f01a64]/10 text-[#f01a64]'}`}>
                        {sentiment > 50 ? 'Bullish' : 'Bearish'}
                    </div>
                </div>

                <div className="flex-1 flex items-end mb-6">
                    <div className="w-full space-y-2">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-white/40">
                            <span>Strong Sell</span>
                            <span>Strong Buy</span>
                        </div>
                        <div className="relative h-2 bg-black/40 rounded-full border border-white/5 overflow-hidden">
                            <div
                                className="absolute top-0 bottom-0 bg-gradient-to-r from-[#f01a64] via-yellow-500 to-[#00b36b] transition-all duration-1000 ease-in-out"
                                style={{ width: `${sentiment}%` }}
                            ></div>
                            <div
                                className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_white] transition-all duration-1000 ease-in-out"
                                style={{ left: `${sentiment}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                        <p className="text-[9px] text-gray-400 font-medium italic">
                            <span className="text-amber-500 font-bold uppercase not-italic mr-1">Signal:</span>
                            {sentiment > 70 ? "Volume spike detected. Optimal for high-yield clusters." :
                                sentiment < 30 ? "Liquidity focus shifted. Recommend defensive scaling." :
                                    "Stable volatility. Perfect for diversified copy-trading."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TradingHub;
