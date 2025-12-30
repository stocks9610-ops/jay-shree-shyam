import React, { useState } from 'react';

const MarketIntelligence: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'crypto' | 'forex' | 'binary'>('crypto');

    const cryptoUpdates = [
        { pair: 'BTC/USDT', price: '68,242', change: '+2.4%', signal: 'BUY' },
        { pair: 'ETH/USDT', price: '3,452', change: '+1.8%', signal: 'STRONG BUY' },
        { pair: 'SOL/USDT', price: '142.5', change: '-0.5%', signal: 'NEUTRAL' },
    ];

    const forexUpdates = [
        { pair: 'EUR/USD', price: '1.0842', change: '+0.12%', signal: 'NEUTRAL' },
        { pair: 'GBP/USD', price: '1.2654', change: '-0.08%', signal: 'SELL' },
        { pair: 'USD/JPY', price: '151.24', change: '+0.45%', signal: 'STRONG BUY' },
    ];

    const binaryUpdates = [
        { pair: 'Pocket Option', status: 'High Volume', payout: '92%', signal: 'BULLISH' },
        { pair: 'IQ Option', status: 'Trending', payout: '85%', signal: 'STABLE' },
        { pair: 'Quotex', status: 'Volatile', payout: '90%', signal: 'BEARISH' },
    ];

    return (
        <div className="bg-[#1e222d] border border-white/5 rounded-3xl p-6 flex flex-col h-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-black uppercase text-[10px] tracking-widest">Market Intelligence</h3>
                <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
                    {(['crypto', 'forex', 'binary'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1 rounded-md text-[8px] font-black uppercase transition-all ${activeTab === tab ? 'bg-[#f01a64] text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 space-y-3">
                {activeTab === 'crypto' && cryptoUpdates.map((update, i) => (
                    <MarketRow key={i} {...update} />
                ))}
                {activeTab === 'forex' && forexUpdates.map((update, i) => (
                    <MarketRow key={i} {...update} />
                ))}
                {activeTab === 'binary' && binaryUpdates.map((update, i) => (
                    <MarketRow key={i} pair={update.pair} price={update.payout} change={update.status} signal={update.signal} isBinary />
                ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/5">
                <div className="bg-[#f01a64]/5 border border-[#f01a64]/10 p-3 rounded-xl">
                    <p className="text-[#f01a64] text-[9px] font-black uppercase mb-1">Alpha Insight</p>
                    <p className="text-gray-400 text-[8px] italic leading-relaxed">
                        "Market liquidity is concentrating in {activeTab} majors. Expect high volatility ahead of the NY session open. Adjust risk parameters accordingly."
                    </p>
                </div>
            </div>
        </div>
    );
};

const MarketRow: React.FC<{ pair: string, price: string, change: string, signal: string, isBinary?: boolean }> = ({ pair, price, change, signal, isBinary }) => (
    <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
        <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${signal.includes('BUY') || signal === 'BULLISH' ? 'bg-[#00b36b]/10 text-[#00b36b]' : signal.includes('SELL') || signal === 'BEARISH' ? 'bg-[#f01a64]/10 text-[#f01a64]' : 'bg-gray-500/10 text-gray-500'}`}>
                {pair.substring(0, 1)}
            </div>
            <div>
                <p className="text-white font-black text-[10px] uppercase group-hover:text-[#f01a64] transition-colors">{pair}</p>
                <p className={`text-[8px] font-bold ${change.startsWith('+') || change === 'High Volume' ? 'text-[#00b36b]' : 'text-[#f01a64]'}`}>{change}</p>
            </div>
        </div>
        <div className="text-right">
            <p className="text-white font-black text-[10px]">{isBinary ? price : `$${price}`}</p>
            <p className={`text-[7px] font-black uppercase tracking-tighter ${signal.includes('BUY') || signal === 'BULLISH' ? 'text-[#00b36b]' : signal.includes('SELL') || signal === 'BEARISH' ? 'text-[#f01a64]' : 'text-gray-500'}`}>{signal}</p>
        </div>
    </div>
);

export default MarketIntelligence;
