
import React, { useState, useEffect, useRef } from 'react';

interface FeedEvent {
  id: string;
  type: 'WIN' | 'LOSS' | 'WITHDRAWAL' | 'EXECUTION';
  trader: string;
  detail: string;
  amount: number;
  timestamp: string;
}

const ELITE_TRADERS = [
  'Earn With Rashid',
  'Master Analyst Guy',
  'Alpha Altcoin Daily',
  'Brian Jung Elite',
  'Binary Edge Pro',
  'Rapid Replicator',
  'Binance Whale Watch',
  'Quantum Scalper'
];

const ASSETS = ['BTC/USDT', 'ETH/USDT', 'XRP/USDT', 'SOL/USDT', 'EUR/USD', 'GBP/JPY'];

const AnimatedCounter = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let animationFrameId: number;
    const startValue = displayValue;
    const endValue = value;
    const startTime = performance.now();
    const duration = 1500;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      const current = startValue + (endValue - startValue) * ease;
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value]);

  return <>{Math.floor(displayValue).toLocaleString()}</>;
};

const MarketChart: React.FC = () => {
  // Aligned with new Liquidity stats (~$45M range)
  const [totalProfit, setTotalProfit] = useState<number>(() => 45200000 + Math.random() * 50000);
  const [lastEvent, setLastEvent] = useState<{ label: string, val: number, isWin: boolean } | null>(null);
  const [history, setHistory] = useState<number[]>(new Array(40).fill(45200000));
  const [volumeBars, setVolumeBars] = useState<number[]>(new Array(20).fill(50));
  const [feed, setFeed] = useState<FeedEvent[]>([]);
  const [glowColor, setGlowColor] = useState<'green' | 'red' | 'neutral'>('neutral');

  useEffect(() => {
    const initialFeed: FeedEvent[] = Array.from({ length: 8 }).map(() => generateRandomEvent());
    setFeed(initialFeed);

    const simulationInterval = setInterval(() => {
      const event = generateRandomEvent();
      setFeed(prev => [event, ...prev].slice(0, 8));

      // Update Volume Bars randomly
      setVolumeBars(prev => {
        const next = [...prev.slice(1), Math.floor(Math.random() * 80) + 20];
        return next;
      });

      if (event.type === 'WIN' || event.type === 'WITHDRAWAL') {
        setTotalProfit(prev => {
          const next = prev + event.amount;
          updateHistory(next);
          return next;
        });
        setLastEvent({ label: 'INFLOW', val: event.amount, isWin: true });
        setGlowColor('green');
        setTimeout(() => setGlowColor('neutral'), 800);
      } else if (event.type === 'LOSS') {
        setTotalProfit(prev => {
          const next = prev - event.amount;
          updateHistory(next);
          return next;
        });
        setLastEvent({ label: 'OUTFLOW', val: event.amount, isWin: false });
        setGlowColor('red');
        setTimeout(() => setGlowColor('neutral'), 800);
      }
    }, 2000);

    return () => clearInterval(simulationInterval);
  }, []);

  const updateHistory = (newVal: number) => {
    setHistory(prev => [...prev.slice(1), newVal]);
  };

  const generateRandomEvent = (): FeedEvent => {
    const r = Math.random();
    const trader = ELITE_TRADERS[Math.floor(Math.random() * ELITE_TRADERS.length)];
    const asset = ASSETS[Math.floor(Math.random() * ASSETS.length)];
    // Strict UTC+5 (Islamabad/Karachi) Timezone
    const now = new Date().toLocaleTimeString('en-US', {
      timeZone: 'Asia/Karachi',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    let type: FeedEvent['type'] = 'EXECUTION';
    let detail = '';
    let amount = 0;

    if (r > 0.85) {
      type = 'WITHDRAWAL';
      amount = Math.floor(Math.random() * 85000) + 5000;
      detail = `Payout Processed (TRC-20)`;
    } else if (r > 0.40) {
      type = 'WIN';
      amount = Math.floor(Math.random() * 45000) + 1200;
      detail = `Closed Long ${asset}`;
    } else if (r > 0.25) {
      type = 'LOSS';
      amount = Math.floor(Math.random() * 12000) + 500;
      detail = `Stop Loss Hit ${asset}`;
    } else {
      type = 'EXECUTION';
      amount = 0;
      detail = `Opened Position ${asset} 100x`;
    }

    return { id: Math.random().toString(36), type, trader, detail, amount, timestamp: now };
  };

  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 1;
  const points = history.map((val, i) => {
    const x = (i / (history.length - 1)) * 100;
    const y = 100 - ((val - min) / range) * 80 - 10;
    return `${x},${y}`;
  }).join(' ');
  const fillPath = `0,100 ${points} 100,100`;

  return (
    <div className="h-full flex flex-col bg-[#1e222d] text-white relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10"
        style={{ backgroundImage: 'linear-gradient(#2a2e39 1px, transparent 1px), linear-gradient(90deg, #2a2e39 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      <div className="relative z-10 flex items-center justify-between p-4 border-b border-[#2a2e39] bg-[#131722]/90 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-[#f01a64] rounded-full animate-ping"></div>
          <div>
            <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tighter leading-none">Global Hub</h2>
            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em]">Verified Exchange Node</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Total Profits Paid</div>
          <div className="text-[10px] text-[#00b36b] font-mono font-bold">Live Market Active</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row relative z-10 overflow-hidden">
        <div className="flex-1 flex flex-col relative border-b lg:border-b-0 lg:border-r border-[#2a2e39]">
          <div className="p-6 md:p-10 flex flex-col items-center justify-center text-center z-10 mt-8 relative">
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px] transition-colors duration-1000 ${glowColor === 'green' ? 'bg-[#00b36b]/20' :
              glowColor === 'red' ? 'bg-red-500/20' :
                'bg-blue-500/5'
              }`}></div>

            <h3 className="relative z-10 text-[#0088cc] text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#0088cc] rounded-full animate-pulse"></span>
              Live Trading Profits Generated
              <span className="w-1.5 h-1.5 bg-[#0088cc] rounded-full animate-pulse"></span>
            </h3>

            <div className="relative z-10 text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter tabular-nums mb-6 drop-shadow-[0_0_25px_rgba(255,255,255,0.15)] scale-y-110">
              <span className="bg-gradient-to-b from-white via-gray-200 to-gray-500 text-transparent bg-clip-text">
                $<AnimatedCounter value={totalProfit} />
              </span>
            </div>

            <div className={`relative z-10 flex items-center gap-3 px-6 py-2 rounded-full border backdrop-blur-md transition-all duration-500 shadow-lg ${lastEvent?.isWin
              ? 'bg-[#00b36b]/10 border-[#00b36b]/40 shadow-[#00b36b]/20'
              : lastEvent?.isWin === false
                ? 'bg-red-500/10 border-red-500/40 shadow-red-500/20'
                : 'bg-gray-800/50 border-gray-700'
              }`}>
              <span className={`text-xl md:text-2xl font-black ${lastEvent?.isWin ? 'text-[#00b36b]' : lastEvent?.isWin === false ? 'text-red-500' : 'text-gray-400'
                }`}>
                {lastEvent ? (lastEvent.isWin ? '+' : '-') : '+'}${lastEvent?.val.toLocaleString() || '0'}
              </span>
              <div className="h-6 w-px bg-white/10 mx-1"></div>
              <span className="text-[9px] text-white font-black uppercase tracking-[0.2em] opacity-80">
                {lastEvent?.label || 'LIVE MARKET FEED'}
              </span>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 h-[50%] opacity-30 pointer-events-none mix-blend-screen">
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
              <polygon points={fillPath} fill="url(#chartGradient)" className="transition-all duration-1000 ease-linear" />
              <polyline fill="none" stroke={lastEvent?.isWin === false ? '#ef4444' : '#00b36b'} strokeWidth="1" points={points} className="transition-all duration-1000 ease-linear" />
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={lastEvent?.isWin === false ? '#ef4444' : '#00b36b'} stopOpacity="0.5" />
                  <stop offset="100%" stopColor={lastEvent?.isWin === false ? '#ef4444' : '#00b36b'} stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* HIDDEN VOLUME BARS ON MOBILE (md:flex) */}
            <div className="hidden md:flex items-end justify-between absolute bottom-0 left-0 right-0 h-20 px-4 gap-1 opacity-50">
              {volumeBars.map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className={`flex-1 rounded-t-sm transition-all duration-1000 ease-out ${i % 2 === 0 ? 'bg-[#00b36b]/30' : 'bg-red-500/30'
                    }`}
                ></div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-96 bg-[#131722]/80 backdrop-blur-sm flex flex-col border-l border-[#2a2e39]">
          <div className="p-3 border-b border-[#2a2e39] bg-[#1e222d] flex items-center justify-between">
            <span className="text-[10px] font-black text-[#00b36b] uppercase tracking-widest animate-pulse">Live Markets</span>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-[#00b36b] rounded-full animate-pulse"></span>
              <span className="w-1.5 h-1.5 bg-[#00b36b] rounded-full animate-pulse [animation-delay:-0.2s]"></span>
            </div>
          </div>

          <div className="flex-1 overflow-y-hidden relative">
            <div className="absolute inset-0 overflow-y-auto no-scrollbar p-3 space-y-2">
              {feed.map((item) => (
                <div key={item.id} className="bg-[#1e222d] border border-[#2a2e39] p-3 rounded-lg flex items-center justify-between animate-in slide-in-from-right duration-500 hover:bg-[#2a2e39] transition-colors group">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.type === 'WIN' ? 'bg-[#00b36b]/10 text-[#00b36b]' :
                      item.type === 'LOSS' ? 'bg-red-500/10 text-red-500' :
                        item.type === 'WITHDRAWAL' ? 'bg-[#f01a64]/10 text-[#f01a64]' :
                          'bg-blue-500/10 text-blue-500'
                      }`}>
                      {item.type === 'WIN' ? '↗' : item.type === 'LOSS' ? '↘' : item.type === 'WITHDRAWAL' ? '$' : '⚡'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-white font-black truncate">{item.trader}</div>
                      <div className="text-[9px] text-gray-500 font-medium truncate">{item.detail}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-[10px] font-black ${item.type === 'LOSS' ? 'text-red-500' : 'text-white'
                      }`}>
                      {item.amount > 0 ? `$${item.amount.toLocaleString()}` : 'ACTIVE'}
                    </div>
                    <div className="text-[8px] text-gray-600 font-mono">{item.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-[#1e222d] border-t border-[#2a2e39] text-center">
            <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]">Live Market Connectivity</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketChart;
