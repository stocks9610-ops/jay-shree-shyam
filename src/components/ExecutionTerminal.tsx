
import React, { useEffect, useState, useRef } from 'react';
import { Strategy } from '../types';

interface ExecutionTerminalProps {
    onComplete: () => void;
    plan: Strategy;
    amount: number;
    traderName?: string;
}

const ExecutionTerminal: React.FC<ExecutionTerminalProps> = ({ onComplete, plan, amount, traderName }) => {
    const [logs, setLogs] = useState<string[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const getMarketContext = () => {
            const hook = plan.hook.toLowerCase();
            const name = plan.name.toLowerCase();

            if (hook.includes('forex') || name.includes('forex')) {
                return {
                    asset: 'EUR/USD',
                    action: 'SELL',
                    leverage: '100x',
                    entry: '1.08452',
                    sl: '1.09100 (+0.6%)',
                    tp: '1.07200 (-1.15%)',
                    terms: ['Pips', 'Lot size', 'Central Bank flow']
                };
            }
            if (hook.includes('gold') || name.includes('gold') || hook.includes('zenith')) {
                return {
                    asset: 'XAU/USD',
                    action: 'BUY',
                    leverage: '50x',
                    entry: '2042.50',
                    sl: '2015.00 (-1.35%)',
                    tp: '2150.00 (+5.26%)',
                    terms: ['Ounces', 'Safe haven flows', 'Yield curve']
                };
            }
            // Default to Crypto
            return {
                asset: 'BTC/USDT',
                action: 'BUY',
                leverage: '20x',
                entry: '64,250.32',
                sl: '62,800.00 (-2.25%)',
                tp: '68,500.00 (+6.61%)',
                terms: ['Gas fees', 'Hashrate', 'Whale wallet']
            };
        };

        const ctx = getMarketContext();
        const steps = [
            { msg: `> Connecting to ${ctx.asset} market feed...`, delay: 200 },
            { msg: `> Analyzing institutional flow on ${ctx.asset}...`, delay: 600 },
            { msg: `> Loading strategy: "${plan.name.toUpperCase()}"...`, delay: 1000 },
            { msg: `> Signal detected: ${ctx.action} @ ${ctx.entry}`, delay: 1400 },
            { msg: `> Allocating mirror capital: $${amount.toLocaleString()}...`, delay: 1800 },
            { msg: `> Opening ${ctx.action} position @ ${ctx.leverage} leverage`, delay: 2200 },
            { msg: `> Stop-loss set at ${ctx.sl}`, delay: 2600 },
            { msg: `> Take-profit target: ${ctx.tp}`, delay: 3000 },
            { msg: `> ${ctx.terms[0]} optimized for minimal slippage`, delay: 3400 },
            { msg: `> Node ID #${Math.floor(1000 + Math.random() * 9000)} active...`, delay: 4000 },
            { msg: `> ${traderName ? `Syncing with ${traderName}'s master node...` : 'Searching for best execution path...'}`, delay: 4300 },
            { msg: `> Protocol engaged. Awaiting target completion...`, delay: 4600 },
        ];

        let timeouts: NodeJS.Timeout[] = [];

        steps.forEach(({ msg, delay }) => {
            const timeout = setTimeout(() => {
                setLogs(prev => [...prev, msg]);
            }, delay);
            timeouts.push(timeout);
        });

        const completionTimeout = setTimeout(() => {
            onComplete();
        }, 5000);

        return () => {
            timeouts.forEach(clearTimeout);
            clearTimeout(completionTimeout);
        };
    }, [onComplete, plan, amount]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="fixed inset-0 z-[300] bg-black flex items-center justify-center p-4">
            {/* Background Matrix Effect (Simplified) */}
            <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
                <div className="animate-pulse text-[#00ff41] text-[10px] whitespace-pre font-mono leading-none" style={{ textShadow: '0 0 5px #00ff41' }}>
                    {Array(50).fill(0).map((_, i) => (
                        <div key={i}>{Math.random().toString(2).substring(2)}</div>
                    ))}
                </div>
            </div>

            <div className="w-full max-w-2xl bg-black border border-[#00ff41] rounded shadow-[0_0_50px_rgba(0,255,65,0.2)] font-mono text-[#00ff41] p-6 relative overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center mb-4 border-b border-[#00ff41]/30 pb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#00ff41] rounded-full animate-ping"></div>
                        <span className="text-xs font-bold tracking-widest uppercase">AI_EXECUTION_TERMINAL_{plan.name.replace(/\s+/g, '_').toUpperCase()}</span>
                    </div>
                    <span className="text-[10px] opacity-70">SECURE_NODE_SYNCED</span>
                </div>

                {/* Logs Area */}
                <div ref={scrollRef} className="h-64 overflow-y-auto font-mono text-sm space-y-2 no-scrollbar">
                    {logs.map((log, index) => (
                        <div key={index} className="animate-in slide-in-from-left-2 duration-300">
                            <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
                            {log}
                        </div>
                    ))}
                    <div className="animate-pulse">_</div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-2 border-t border-[#00ff41]/30 flex justify-between text-[10px] opacity-60">
                    <span>NODE: 0x{Math.random().toString(16).substr(2, 6).toUpperCase()}</span>
                    <span>LATENCY: {Math.floor(Math.random() * 15 + 5)}ms</span>
                    <span>STATUS: EXECUTING</span>
                </div>
            </div>
        </div>
    );
};

export default ExecutionTerminal;

