// Force rebuild after button fix
import { Strategy } from '../types';

interface SignalCardProps {
    plan: Strategy;
    onCopy: (plan: Strategy) => void;
    isLocked: boolean;
}

const SignalCard: React.FC<SignalCardProps> = ({ plan, onCopy, isLocked }) => {
    // Generate a consistent "Fake" Entry price based on ID
    // SAFEGUARD: Ensure plan and plan.id exist
    const planId = plan?.id || 'default';
    const seed = planId.charCodeAt(0) || 0;

    // SAFEGUARD: Ensure plan.name exists before calling toLowerCase
    const planName = plan?.name || 'Unknown Strategy';
    const isCrypto = planName.toLowerCase().includes('btc') || planName.toLowerCase().includes('eth');

    const entryPrice = isCrypto
        ? (40000 + (seed * 100)).toLocaleString()
        : (2000 + (seed * 10)).toLocaleString();

    // Generate a "Live" PnL that looks attractive
    // SAFEGUARD: Ensure plan.minRet exists
    const pnl = ((plan?.minRet || 10) / 10).toFixed(2);

    return (
        <div
            onClick={() => !isLocked && onCopy(plan)}
            className={`
                relative min-w-[280px] md:min-w-[320px] p-5 rounded-3xl border transition-all duration-300 group cursor-pointer
                ${isLocked
                    ? 'bg-[#1e222d] border-white/5 opacity-70 grayscale'
                    : plan.isHot
                        ? 'bg-gradient-to-b from-[#1e222d] to-[#f01a64]/10 border-[#f01a64] shadow-[0_0_30px_-10px_#f01a64]'
                        : 'bg-[#1e222d] border-white/10 hover:border-[#f01a64]/50 hover:shadow-xl'
                }
            `}
        >
            {/* Live Badge */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className={`w-2 h-2 rounded-full ${isLocked ? 'bg-gray-500' : 'bg-[#00b36b]'} animate-pulse`}></div>
                        {!isLocked && <div className="absolute inset-0 bg-[#00b36b] rounded-full animate-ping opacity-75"></div>}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isLocked ? 'text-gray-500' : 'text-[#00b36b]'}`}>
                        {isLocked ? 'SIGNAL LOCKED' : 'LIVE SIGNAL'}
                    </span>
                </div>
                {plan.vip && (
                    <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                        VIP
                    </span>
                )}
            </div>

            {/* Asset Info */}
            <div className="mb-4">
                <h3 className="text-white font-black text-xl md:text-2xl uppercase italic truncate">{plan.name}</h3>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mt-1">
                    Entry: <span className="text-white">${entryPrice}</span>
                </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2 mb-6">
                <div className="bg-black/30 p-2 rounded-lg">
                    <span className="text-[9px] text-gray-500 font-bold uppercase block">Current PnL</span>
                    <span className={`text-lg font-black ${isLocked ? 'text-gray-400' : 'text-[#00b36b]'}`}>
                        +{pnl}%
                    </span>
                </div>
                <div className="bg-black/30 p-2 rounded-lg">
                    <span className="text-[9px] text-gray-500 font-bold uppercase block">Expiry</span>
                    <span className="text-lg font-black text-white">{plan.duration}</span>
                </div>
            </div>

            {/* Action Button */}
            <button
                onClick={() => !isLocked && onCopy(plan)}
                disabled={isLocked}
                className={`
                    w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all
                    ${isLocked
                        ? 'bg-white/5 text-gray-500 cursor-not-allowed opacity-50'
                        : plan.isHot
                            ? 'bg-[#f01a64] text-white shadow-lg shadow-[#f01a64]/30 hover:bg-pink-600 animate-pulse'
                            : 'bg-white/10 text-white hover:bg-white/20'
                    }`
                }
            >
                {isLocked ? 'Deposit to Unlock' : '⚡ Copy Signal'}
            </button>

            {/* Hot Badge */}
            {plan.isHot && !isLocked && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg border-2 border-[#131722]">
                    🔥 Hot Pick
                </div>
            )}
        </div>
    );
};

export default SignalCard;
