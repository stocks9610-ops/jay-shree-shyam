
import React, { useEffect, useRef } from 'react';

const TradingViewChart: React.FC = () => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (container.current && !container.current.querySelector('script')) {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = JSON.stringify({
        "autosize": true,
        "symbol": "BINANCE:BTCUSDT",
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "enable_publishing": false,
        "hide_side_toolbar": false,
        "allow_symbol_change": true,
        "calendar": false,
        "studies": [
          "RSI@tv-basicstudies",
          "MASimple@tv-basicstudies"
        ],
        "support_host": "https://www.tradingview.com"
      });
      container.current.appendChild(script);
    }
  }, []);

  return (
    <div className="tradingview-widget-container h-full w-full" ref={container}>
      <div className="tradingview-widget-container__widget h-[calc(100%-32px)] w-full"></div>
      <div className="tradingview-widget-copyright bg-[#1e222d] text-[10px] text-gray-500 px-4 py-2 flex justify-between items-center border-t border-[#2a2e39]">
        <span className="font-black uppercase tracking-widest">Global Terminal Alpha-1</span>
        <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank" className="hover:text-white transition-colors">
          Tracked by TradingView
        </a>
      </div>
    </div>
  );
};

export default TradingViewChart;
