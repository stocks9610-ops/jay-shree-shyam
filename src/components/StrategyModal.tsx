import React from 'react';
import { Strategy } from '../types';

interface StrategyModalProps {
    isOpen: boolean;
    onClose: () => void;
    strategies: Strategy[];
    onSelectStrategy: (strategyId: string) => void;
    userBalance: number;
    hasDeposited: boolean;
    isStrategyUnlocked: boolean;
}

const StrategyModal: React.FC<StrategyModalProps> = ({
    isOpen,
    onClose,
    strategies,
    onSelectStrategy,
    hasDeposited,
    isStrategyUnlocked
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#1e222d] w-full max-w-4xl max-h-[85vh] rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#131722]/50">
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Signal Gallery</h2>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Select a Master Signal to copy</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {strategies.map(plan => {
                            // Strict Backend Control:
                            // Plan is locked if user hasn't deposited AND admin hasn't explicitly unlocked strategies
                            const isLocked = !hasDeposited && !isStrategyUnlocked;

                            return (
                                <div
                                    key={plan.id}
                                    onClick={() => {
                                        if (!isLocked) {
                                            onSelectStrategy(plan.id!);
                                            onClose();
                                        }
                                    }}
                                    className={`bg-[#131722] border-2 group relative overflow-hidden p-6 rounded-[2rem] transition-all duration-300 ${isLocked
                                        ? 'opacity-60 cursor-not-allowed border-white/5'
                                        : 'cursor-pointer hover:bg-[#1a1e29] border-white/5 hover:border-[#f01a64]/50 hover:shadow-[0_0_30px_rgba(240,26,100,0.15)]'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-white font-black text-lg uppercase group-hover:text-[#f01a64] transition-colors">{plan.name}</h4>
                                        {isLocked && <span className="text-[8px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full font-black">LOCKED</span>}
                                    </div>

                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-6 h-8 line-clamp-2">{plan.hook}</p>

                                    <div className="flex justify-between items-end mt-auto">
                                        <div>
                                            <span className="block text-[8px] text-gray-600 font-black uppercase mb-0.5">Return</span>
                                            <span className="text-[#00b36b] font-black text-xl">{plan.minRet}-{plan.maxRet}%</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-[8px] text-gray-600 font-black uppercase mb-0.5">Duration</span>
                                            <span className="text-white font-black text-lg">{plan.duration}</span>
                                        </div>
                                    </div>

                                    {isLocked && (
                                        <div className="absolute inset-x-0 bottom-0 bg-amber-500/10 border-t border-amber-500/20 p-2 text-center">
                                            <span className="text-[8px] text-amber-500 font-bold uppercase tracking-widest">Deposit Required</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StrategyModal;
