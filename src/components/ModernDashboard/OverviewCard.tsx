import React from 'react';
import { UserData } from '../../services/userService';

interface OverviewCardProps {
    user: UserData | null;
}

const OverviewCard: React.FC<OverviewCardProps> = ({ user }) => {
    const balance = user?.balance || 0;
    const initialDeposit = user?.initialDeposit || 0; // Assuming we add this to tracking, or approximate
    const totalProfit = balance - initialDeposit;
    const isProfit = totalProfit >= 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Main Balance Card */}
            <div className="md:col-span-2 relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#f01a64] to-purple-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                <div className="relative h-full bg-[#1e222d] rounded-3xl p-8 border border-white/5 flex flex-col justify-between overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#f01a64]/10 to-transparent rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                    <div className="relative z-10">
                        <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2 font-mono">Total Portfolio Value</p>
                        <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4">
                            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </h2>

                        <div className="flex items-center gap-4">
                            <div className={`px-3 py-1.5 rounded-lg border ${isProfit ? 'bg-[#00b36b]/10 border-[#00b36b]/20 text-[#00b36b]' : 'bg-[#f01a64]/10 border-[#f01a64]/20 text-[#f01a64]'} flex items-center gap-2`}>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={isProfit ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
                                </svg>
                                <span className="text-sm font-black">{isProfit ? '+' : ''}{totalProfit.toFixed(2)} USD</span>
                            </div>
                            <span className="text-gray-500 text-xs font-bold uppercase">All time PnL</span>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button className="flex-1 bg-[#f01a64] hover:bg-[#d01555] text-white py-4 rounded-xl font-black uppercase text-sm tracking-wider shadow-lg shadow-[#f01a64]/20 transition-all hover:-translate-y-1 active:scale-95">
                            Deposit
                        </button>
                        <button className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl font-black uppercase text-sm tracking-wider border border-white/5 transition-all hover:-translate-y-1 active:scale-95">
                            Withdraw
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Stats Column */}
            <div className="space-y-6">
                <div className="bg-[#1e222d] p-6 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-[#00b36b]/30 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg className="w-16 h-16 text-[#00b36b]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Active Trades</p>
                    <p className="text-3xl font-black text-white">{user?.activeTrades?.length || 0}</p>
                    <p className="text-[#00b36b] text-xs font-bold mt-2">Running now</p>
                </div>

                <div className="bg-[#1e222d] p-6 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg className="w-16 h-16 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Copy Status</p>
                    <p className="text-xl font-black text-white">{user?.activeTrades?.length ? 'MIRRORING' : 'IDLE'}</p>
                    <p className="text-purple-500 text-xs font-bold mt-2">{user?.activeTrades?.length ? 'High Frequency connection' : 'Select a trader'}</p>
                </div>
            </div>
        </div>
    );
};

export default OverviewCard;
