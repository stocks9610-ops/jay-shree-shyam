import React from 'react';

interface VIPProgressProps {
    currentBalance: number;
    onDeposit: () => void;
}

const VIPProgress: React.FC<VIPProgressProps> = ({ currentBalance, onDeposit }) => {
    const nextTier = 1000;
    const progress = Math.min(100, (currentBalance / nextTier) * 100);
    const toUnlock = Math.max(0, nextTier - currentBalance);

    return (
        <div className="bg-gradient-to-r from-[#1e222d] to-[#131722] border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-50">
                <div className="w-16 h-16 bg-amber-500/10 rounded-full blur-xl"></div>
            </div>

            <div className="flex justify-between items-end mb-4 relative z-10">
                <div>
                    <h3 className="text-amber-500 font-black uppercase text-xs tracking-widest mb-1">VIP Status: Standard</h3>
                    <p className="text-gray-400 text-[10px] font-medium">
                        {toUnlock > 0
                            ? `Deposit $${toUnlock} to unlock ZERO fees & Priority Support`
                            : "You are close to unlocking Diamond Tier!"}
                    </p>
                </div>
                <div className="text-right">
                    <span className="text-white font-black text-xl italic">${currentBalance}</span>
                    <span className="text-gray-500 text-xs font-bold"> / ${nextTier}</span>
                </div>
            </div>

            <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
                <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                >
                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                </div>
            </div>

            <button
                onClick={onDeposit}
                className="w-full py-3 bg-amber-500/10 border border-amber-500/50 text-amber-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-black transition-all active:scale-95"
            >
                Upgrade Status Now
            </button>
        </div>
    );
};

export default VIPProgress;
