
import React, { useEffect, useState, useRef } from 'react';
import { Strategy } from '../types';

interface LiveTradeSimulatorProps {
    tradeId: string;
    plan: Strategy;
    investAmount: number;
    startTime: number;
    currentPnL: number;
    progress: number;
}


const PROTOCOL_LOGS = [
    "SYNCING NODE_CLUSTERS...",
    "LATENCY CHECK: 12ms [OK]",
    "VERIFYING LIQUIDITY POOL...",
    "ENCRYPTING HANDSHAKE...",
    "OPTIMIZING ENTRY VECTOR...",
    "PACKET_LOSS: 0.00% [STABLE]",
    "AI_SENTIMENT: BULLISH_divergence",
    "EXECUTING QUANT_ALGO_V4...",
    "LEDGER UPDATE: CONFIRMED",
    "PROXY ROUTING: SECURE",
    "HASH_RATE: 450 TH/s",
    "ARBITRAGE SCAN: NEGATIVE"
];

const LiveTradeSimulator: React.FC<LiveTradeSimulatorProps> = ({ plan, investAmount, currentPnL, progress }) => {
    // Simulate live price movement for visual effect
    const [currentPrice, setCurrentPrice] = useState(42000 + Math.random() * 100);
    const [entryPrice] = useState(42000);
    const [logs, setLogs] = useState<string[]>([]);
    const logsEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            // Random walk for price
            setCurrentPrice(prev => prev + (Math.random() - 0.45) * 50);
        }, 1000);

        // Protocol Log Generator
        const logInterval = setInterval(() => {
            const randomLog = PROTOCOL_LOGS[Math.floor(Math.random() * PROTOCOL_LOGS.length)];
            const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
            const pnlString = Math.random() > 0.7 ? ` [YIELD: +${(Math.random() * 2).toFixed(1)}%]` : '';

            setLogs(prev => {
                const newLogs = [...prev, `[${time}] ${randomLog}${pnlString}`];
                if (newLogs.length > 6) return newLogs.slice(newLogs.length - 6);
                return newLogs;
            });
        }, 1500);

        return () => {
            clearInterval(interval);
            clearInterval(logInterval);
        };
    }, []);

    // Auto-scroll logs
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    const radius = 50;
    const stroke = 6;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    const isProfit = currentPnL >= 0;
    const color = isProfit ? '#00b36b' : '#f01a64';

    return (
        <div className="bg-[#131722] border border-white/5 p-0 rounded-[2rem] shadow-2xl overflow-hidden relative group">

            {/* Top Section: Visuals */}
            <div className="relative p-6 z-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-[#1e222d]/50 backdrop-blur-sm">

                {/* Left: Radial Progress & Timer */}
                <div className="flex items-center justify-center relative">
                    <div className="relative w-32 h-32">
                        {/* Glow Effect */}
                        <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 animate-pulse ${isProfit ? 'bg-[#00b36b]' : 'bg-[#f01a64]'}`}></div>

                        <svg height="100%" width="100%" className="-rotate-90">
                            <circle
                                stroke="#2a2e39"
                                strokeWidth={stroke}
                                fill="transparent"
                                r={normalizedRadius}
                                cx={radius * 1.28}
                                cy={radius * 1.28}
                                className="w-full h-full"
                                style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
                            />
                            <circle
                                stroke={color}
                                strokeWidth={stroke}
                                strokeDasharray={circumference + ' ' + circumference}
                                style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.1s linear' }}
                                strokeLinecap="round"
                                fill="transparent"
                                r={normalizedRadius}
                                cx={radius * 1.28}
                                cy={radius * 1.28}
                                className="drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                            />
                        </svg>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Time Left</span>
                            <span className="text-xl font-black text-white font-mono tabular-nums">
                                {Math.ceil((plan.durationMs * (1 - progress / 100)) / 1000)}s
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Trade Stats */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-black/30 p-3 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full animate-pulse ${isProfit ? 'bg-[#00b36b]' : 'bg-[#f01a64]'}`}></div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Live Sync</span>
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${isProfit ? 'bg-[#00b36b]/10 text-[#00b36b]' : 'bg-[#f01a64]/10 text-[#f01a64]'}`}>
                            {isProfit ? 'In The Profit' : 'Drawdown'}
                        </span>
                    </div>

                    <div>
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest block mb-1">Estimated Yield</span>
                        <div className={`text-3xl font-black font-mono tracking-tight transition-colors duration-300 ${isProfit ? 'text-[#00b36b]' : 'text-[#f01a64]'}`}>
                            {currentPnL >= 0 ? '+' : ''}${currentPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>

                    <div className="flex justify-between text-[10px] font-mono text-gray-400 bg-black/20 p-2 rounded-lg">
                        <span>ENT: <span className="text-white">${entryPrice.toLocaleString()}</span></span>
                        <span>CUR: <span className={isProfit ? 'text-[#00b36b]' : 'text-[#f01a64]'}>${currentPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></span>
                    </div>
                </div>
            </div>

            {/* Bottom: Terminal Log */}
            <div className="bg-black/80 border-t border-white/5 p-4 font-mono text-[9px] md:text-[10px] text-[#00b36b] h-32 overflow-hidden relative">
                <div className="absolute top-2 right-2 text-[8px] text-gray-600 font-black uppercase">Protocol Log v2.1</div>
                <div className="space-y-1">
                    {logs.map((log, i) => (
                        <div key={i} className="animate-in slide-in-from-left-2 fade-in duration-300">
                            <span className="opacity-50 mr-2">{'>'}</span>{log}
                        </div>
                    ))}
                    <div ref={logsEndRef} />
                </div>
                {/* Scanline Effect */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20"></div>
            </div>

            {/* Active Border Gradient */}
            <div className={`absolute inset-0 border-2 rounded-[2rem] opacity-50 pointer-events-none transition-colors duration-500 ${isProfit ? 'border-[#00b36b]/30' : 'border-[#f01a64]/30'}`}></div>
        </div>
    );
};

export default LiveTradeSimulator;
