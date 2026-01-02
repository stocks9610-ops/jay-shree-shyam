import React, { useEffect, useRef } from 'react';

declare global {
    interface Window {
        TradingView: any;
    }
}

const LiveMarketChart: React.FC = () => {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let tvWidget: any = null;

        const initWidget = () => {
            if (container.current && window.TradingView) {
                tvWidget = new window.TradingView.widget({
                    "autosize": true,
                    "symbol": "BINANCE:BTCUSDT",
                    "interval": "1",
                    "timezone": "Etc/UTC",
                    "theme": "dark",
                    "style": "1",
                    "locale": "en",
                    "toolbar_bg": "#f1f3f6",
                    "enable_publishing": false,
                    "hide_side_toolbar": false,
                    "allow_symbol_change": true,
                    "container_id": container.current.id,
                    "backgroundColor": "#131722",
                    "gridColor": "rgba(42, 46, 57, 0.06)",
                    "save_image": false,
                    "height": 400
                });
            }
        };

        if (!window.TradingView) {
            const script = document.createElement('script');
            script.src = 'https://s3.tradingview.com/tv.js';
            script.async = true;
            script.id = 'tradingview-widget-script';
            script.onload = initWidget;
            document.head.appendChild(script);
        } else {
            initWidget();
        }

        return () => {
            // We don't remove the global script to avoid redundant re-loads
            // But we could clear the container
            if (container.current) {
                container.current.innerHTML = '';
            }
        };
    }, []);

    return (
        <div className="bg-[#1e222d] border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative group">
            <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#00b36b] rounded-full animate-pulse"></div>
                    <h3 className="text-white font-black uppercase text-[10px] tracking-widest">Live Alpha Stream</h3>
                </div>
                <div className="flex gap-2">
                    <span className="text-[8px] bg-[#f01a64]/10 text-[#f01a64] px-2 py-0.5 rounded font-black uppercase">Direct Handshake</span>
                    <span className="text-[8px] bg-white/5 text-gray-500 px-2 py-0.5 rounded font-black uppercase">9ms Latency</span>
                </div>
            </div>
            <div
                id={`tradingview_${Math.random().toString(36).substring(7)}`}
                ref={container}
                className="w-full h-[400px]"
            />
        </div>
    );
};

export default LiveMarketChart;
