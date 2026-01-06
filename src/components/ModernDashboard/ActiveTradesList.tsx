import React from 'react';
import { ActiveTrade } from '../../types';

interface ActiveTradesListProps {
    trades: ActiveTrade[] | undefined;
}

const ActiveTradesList: React.FC<ActiveTradesListProps> = ({ trades }) => {
    if (!trades || trades.length === 0) {
        return (
            <div className="bg-[#1e222d] rounded-3xl p-8 border border-white/5 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gray-500">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg mb-1">No Active Trades</h3>
                    <p className="text-gray-500 text-sm">Start copying a master trader to see live positions here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#1e222d] rounded-3xl border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-black text-white uppercase tracking-widest text-sm">Active Positions</h3>
                <span className="text-xs font-bold text-[#00b36b] bg-[#00b36b]/10 px-3 py-1 rounded-lg animate-pulse">
                    ● Live Sync
                </span>
            </div>

            <div className="divide-y divide-white/5">
                {trades.map((trade) => (
                    <div key={trade.id} className="p-6 hover:bg-white/[0.02] transition-colors group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            {/* Left: Asset Info */}
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center font-black text-white text-xs shadow-lg">
                                    BTC
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-black text-white">BTC/USDT</h4>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${trade.type === 'BUY' ? 'bg-[#00b36b]/20 text-[#00b36b]' : 'bg-[#f01a64]/20 text-[#f01a64]'}`}>
                                            {trade.type}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 font-mono mt-1">Entry: ${trade.entryPrice.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Center: Progress */}
                            <div className="flex-1 md:px-8">
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-gray-500 font-bold">Progress</span>
                                    <span className="text-white font-mono">{trade.progress.toFixed(0)}%</span>
                                </div>
                                <div className="h-1.5 bg-black rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#f01a64] to-purple-600 transition-all duration-1000 ease-linear"
                                        style={{ width: `${trade.progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Right: PnL & Amount */}
                            <div className="text-right">
                                <p className={`text-lg font-black ${trade.currentPnL >= 0 ? 'text-[#00b36b]' : 'text-[#f01a64]'}`}>
                                    {trade.currentPnL >= 0 ? '+' : ''}{trade.currentPnL.toFixed(2)} USD
                                </p>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                                    Invested: ${trade.investAmount}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActiveTradesList;
