import React, { useEffect, useState } from 'react';

const NAMES = ['Alex M.', 'Sarah K.', 'Davide R.', 'Wei L.', 'Priya S.', 'Marcus J.', 'Elena B.', 'Tom H.'];
const ACTIONS = ['copied', 'synced with', 'followed', 'invested in'];
const SIGNALS = ['BTC Turbo', 'ETH Scalp', 'Gold Swing', 'VIP Alpha', 'Forex Sniper'];
const AMOUNTS = ['$100', '$250', '$500', '$1,200', '$5,000'];

const SocialTicker: React.FC = () => {
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        // Initial population
        const initial = Array(5).fill(0).map(generateMessage);
        setMessages(initial);

        // Add new message every 3-7 seconds
        const interval = setInterval(() => {
            setMessages(prev => [generateMessage(), ...prev.slice(0, 4)]);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    function generateMessage() {
        const name = NAMES[Math.floor(Math.random() * NAMES.length)];
        const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
        const signal = SIGNALS[Math.floor(Math.random() * SIGNALS.length)];
        const amount = AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)];
        return `${name} just ${action} ${signal} (${amount})`;
    }

    return (
        <div className="w-full bg-[#131722] border-b border-white/5 overflow-hidden py-2 relative z-10">
            <div className="flex gap-8 animate-marquee whitespace-nowrap">
                {/* Duplicate for infinite scroll illusion */}
                {[...messages, ...messages].map((msg, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider text-gray-400">
                        <span className="w-1.5 h-1.5 bg-[#00b36b] rounded-full animate-pulse"></span>
                        {msg}
                    </div>
                ))}
            </div>
            {/* Gradient Fade Edges */}
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#131722] to-transparent pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#131722] to-transparent pointer-events-none"></div>
        </div>
    );
};

export default SocialTicker;
