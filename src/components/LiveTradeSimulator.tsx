
import React, { useEffect, useState } from 'react';
import { Strategy } from '../types';

interface LiveTradeSimulatorProps {
    tradeId: string;
    plan: Strategy;
    investAmount: number;
    startTime: number;
    currentPnL: number;
    progress: number;
}

const LiveTradeSimulator: React.FC<LiveTradeSimulatorProps> = ({ plan, investAmount, currentPnL, progress }) => {
    // Simulate live price movement for visual effect
    const [currentPrice, setCurrentPrice] = useState(42000 + Math.random() * 100);
    const [entryPrice] = useState(42000);

    useEffect(() => {
        const interval = setInterval(() => {
            // Random walk for price
            setCurrentPrice(prev => prev + (Math.random() - 0.45) * 50);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const radius = 50;
    const stroke = 6;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="bg-[#1e222d] border border-[#f01a64]/40 p-6 rounded-[2.5rem] shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#f01a64] to-transparent opacity-50"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Left: Radial Progress & Timer */}
                <div className="flex items-center justify-center relative">
                    <div className="relative w-32 h-32">
                        <svg height="100%" width="100%" className="-rotate-90">
                            <circle
                                stroke="#2a2e39"
                                strokeWidth={stroke}
                                fill="transparent"
                                r={normalizedRadius}
                                cx={radius * 1.28} // Adjust for bounding box if needed, or simply use %
                                cy={radius * 1.28}
                                className="w-full h-full"
                                style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
                            />
                            <circle
                                stroke="#f01a64"
                                strokeWidth={stroke}
                                strokeDasharray={circumference + ' ' + circumference}
                                style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.1s linear' }}
                                strokeLinecap="round"
                                fill="transparent"
                                r={normalizedRadius}
                                cx={radius * 1.28}
                                cy={radius * 1.28}
                                className="drop-shadow-[0_0_10px_rgba(240,26,100,0.8)]"
                            />
                        </svg>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Execution Window</span>
                            <span className="text-xl font-black text-white font-mono">
                                {Math.ceil((plan.durationMs * (1 - progress / 100)) / 1000)}s
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Trade Stats */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-black/30 p-3 rounded-xl border border-white/5">
                        <div>
                            <span className="text-[9px] text-gray-500 font-bold uppercase block">Asset Pair</span>
                            <span className="text-white font-black text-sm">BTC/USDT</span>
                        </div>
                        <div>
                            <span className="text-[9px] text-gray-500 font-bold uppercase block text-right">Side</span>
                            <span className="text-[#00b36b] font-black text-sm uppercase">LONG 10x</span>
                        </div>
                    </div>

                    <div>
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest block mb-1">Live Net Yield</span>
                        <span className="text-3xl font-black font-mono text-[#00b36b] drop-shadow-[0_0_15px_rgba(0,179,107,0.4)]">
                            +${currentPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>

                    <div className="flex justify-between text-[10px] font-mono text-gray-400">
                        <span>Entry: ${entryPrice.toLocaleString()}</span>
                        <span>Mark: ${currentPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                </div>
            </div>

            {/* Animated Pulse Overlay */}
            <div className="absolute inset-0 bg-[#f01a64]/5 animate-pulse rounded-[2.5rem] pointer-events-none"></div>
        </div>
    );
};

export default LiveTradeSimulator;
