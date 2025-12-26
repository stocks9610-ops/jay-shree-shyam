
import React, { useEffect, useState, useRef } from 'react';

interface ExecutionTerminalProps {
    onComplete: () => void;
    planName: string;
    amount: number;
}

const ExecutionTerminal: React.FC<ExecutionTerminalProps> = ({ onComplete, planName, amount }) => {
    const [logs, setLogs] = useState<string[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const steps = [
            { msg: `> Connecting to market feed...`, delay: 200 },
            { msg: `> Analyzing price action on BTC/USDT...`, delay: 600 },
            { msg: `> Loading strategy: "${planName.toUpperCase()}"...`, delay: 1000 },
            { msg: `> Entry signal detected at $42,850.32`, delay: 1400 },
            { msg: `> Allocating capital: $${amount.toLocaleString()}...`, delay: 1800 },
            { msg: `> Opening LONG position @ 10x leverage`, delay: 2200 },
            { msg: `> Stop-loss set at $42,100 (-1.75%)`, delay: 2600 },
            { msg: `> Take-profit target: $43,500 (+1.52%)`, delay: 3000 },
            { msg: `> Order filled. Position ID: #TRD-${Math.floor(10000 + Math.random() * 90000)}`, delay: 3400 },
            { msg: `> Trade active. Monitoring for exit...`, delay: 4000 },
            { msg: `> Position confirmed. Good luck!`, delay: 4600 },
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
    }, [onComplete, planName, amount]);

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
                        <span className="text-xs font-bold tracking-widest">AI_EXECUTION_TERMINAL_V4.2</span>
                    </div>
                    <span className="text-[10px] opacity-70">SECURE_LINK_ESTABLISHED</span>
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
                    <span>CPU: 12%</span>
                    <span>MEM: 432MB</span>
                    <span>NET: 1.2GB/s</span>
                </div>
            </div>
        </div>
    );
};

export default ExecutionTerminal;
