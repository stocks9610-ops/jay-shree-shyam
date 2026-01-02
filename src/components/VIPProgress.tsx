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
                className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 group/btn"
            >
                Upgrade Status Now
                <span className="bg-black/20 px-2 py-0.5 rounded-md text-[8px] animate-pulse">HOT</span>
            </button>

            {/* VIP Perks */}
            <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
                <h4 className="text-white/40 font-black text-[9px] uppercase tracking-[0.2em] mb-4">Tier Benefits</h4>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500">⚡</div>
                        <div>
                            <p className="text-white font-black text-[9px] uppercase">Priority</p>
                            <p className="text-gray-500 text-[8px]">Faster Support</p>
                        </div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500">🛡️</div>
                        <div>
                            <p className="text-white font-black text-[9px] uppercase">Shield</p>
                            <p className="text-gray-500 text-[8px]">0% Trading Fee</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Milestones */}
            <div className="mt-4 bg-black/40 p-3 rounded-xl border border-white/5 overflow-hidden">
                <div className="flex gap-4 animate-[scroll_20s_linear_infinite] whitespace-nowrap">
                    <span className="text-[9px] font-black text-amber-500/50 uppercase italic tracking-widest">• $1,000 NEXT MILESTONE •</span>
                    <span className="text-[9px] font-black text-white/20 uppercase italic tracking-widest">• UNLOCK ALPHA ALGO •</span>
                    <span className="text-[9px] font-black text-amber-500/50 uppercase italic tracking-widest">• $5,000 DIAMOND TIER •</span>
                </div>
            </div>
        </div>
    );
};

export default VIPProgress;
