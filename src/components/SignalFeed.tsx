import React from 'react';
import { Strategy } from '../types';
import SignalCard from './SignalCard';

interface SignalFeedProps {
    plans: Strategy[];
    onCopy: (plan: Strategy) => void;
    userDeposited: boolean;
    isDemo: boolean;
    demoCount: number;
}

const SignalFeed: React.FC<SignalFeedProps> = ({ plans, onCopy, userDeposited, isDemo, demoCount }) => {
    return (
        <div className="relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 md:mb-6 px-2">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse absolute top-0 left-0"></span>
                        <span className="w-3 h-3 bg-red-600 rounded-full animate-ping absolute top-0 left-0 opacity-75"></span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-wider">
                        Live Master Signals
                    </h3>
                </div>
                <div className="text-[10px] text-[#00b36b] font-black uppercase tracking-widest bg-[#00b36b]/10 px-3 py-1 rounded-full animate-pulse">
                    {plans.length} Signals Active
                </div>
            </div>

            {/* Horizontal Scroll Feed */}
            <div className="flex gap-4 overflow-x-auto pb-8 px-2 custom-scrollbar snap-x snap-mandatory">
                {plans.map(plan => {
                    const isPremium = plan.vip;
                    // Locked if VIP AND NOT (Deposited OR Demo Active)
                    // Simplified: VIP requires Deposit. 
                    // Special case: If Demo is active, allow all (unless we enforce 3 limit logic elsewhere)
                    const isLocked = isPremium && !userDeposited && (!isDemo || demoCount >= 3);

                    return (
                        <div key={plan.id} className="snap-center">
                            <SignalCard
                                plan={plan}
                                onCopy={onCopy}
                                isLocked={isLocked}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Fade effect on right */}
            <div className="absolute right-0 top-12 bottom-8 w-24 bg-gradient-to-l from-[#131722] to-transparent pointer-events-none md:hidden"></div>
        </div>
    );
};

export default SignalFeed;
