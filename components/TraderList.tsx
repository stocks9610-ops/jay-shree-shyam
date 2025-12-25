import React, { useState, useEffect, useRef } from 'react';
import { Trader } from '../types';
import TraderProfileModal from './TraderProfileModal';
import { subscribeToTraders, FirebaseTrader } from '../services/firebaseService';

interface ExtendedTrader extends Trader {
  category: 'crypto' | 'binary' | 'gold' | 'forex';
}

// Fallback traders in case Firebase is not configured yet
const FALLBACK_TRADERS: ExtendedTrader[] = [
  {
    id: '0', name: 'Anas Ali (Elite Signal)',
    avatar: 'https://raw.githubusercontent.com/stocks9610-ops/Stocks-Analysis/new-launch/public/images/1.jpeg',
    roi: 342.5, drawdown: 3.2, followers: 185000, weeks: 156, strategy: 'Signal & Mindset Architecture',
    type: 'Educator', experienceYears: 6, markets: ['Crypto', 'Signals'], riskScore: 3,
    winRate: 88.5, avgDuration: '1 day', riskMethods: ['Mindset Control', 'Risk Awareness'],
    bio: 'Anas Ali is a fast-growing forex and crypto trader known for high-accuracy Risk Free trade signals and bold market execution. He leads one of Asia\'s largest trading communities and focuses on disciplined strategies, consistency, and profit-driven trading.',
    category: 'crypto',
    copyTradeId: 'CT-7701-X',
    youtubeLink: 'https://www.youtube.com/watch?v=dvQzEIbJlw4'
  },
  {
    id: '10', name: 'Rayner Teo',
    avatar: 'https://raw.githubusercontent.com/stocks9610-ops/Stocks-Analysis/new-launch/public/images/27.jpeg',
    roi: 485.4, drawdown: 2.1, followers: 1500000, weeks: 460, strategy: 'Structured Price Action Logic',
    type: 'Educator', experienceYears: 12, markets: ['Forex', 'Stocks', 'Crypto'], riskScore: 2,
    winRate: 82.5, avgDuration: '2 days', riskMethods: ['Price Action', 'Capital Preservation'],
    bio: 'Rayner Teo is an independent trader and founder of TradingwithRayner, known for clear, profit-first content covering price action, technical analysis, and risk-free management, and structured trading strategies across forex, stocks, and crypto. With millions of subscribers, his mission is to help serious traders improve performance with practical, no-hype guidance.',
    category: 'crypto',
    copyTradeId: 'CT-2710-RT',
    youtubeLink: 'https://www.youtube.com/channel/UCFSn-h8wTnhpKJMteN76Abg'
  },
  {
    id: '1', name: 'Thomas Kralow (Pro)',
    avatar: 'https://raw.githubusercontent.com/stocks9610-ops/Stocks-Analysis/new-launch/public/images/2.jpeg',
    roi: 410.8, drawdown: 4.5, followers: 452000, weeks: 312, strategy: 'Business-Grade Market Logic',
    type: 'Trader', experienceYears: 9, markets: ['Crypto', 'Stocks'], riskScore: 4,
    winRate: 92.1, avgDuration: '3 days', riskMethods: ['Portfolio Hedging', 'Growth Scaling'],
    bio: 'Thomas Kralow is a high-performance crypto and forex trader known for AI-driven trading strategies. With 500K+ subscribers, he shares bold market insights, aggressive setups, and next-level trading education designed for serious traders. Risk Free Trade',
    category: 'crypto',
    copyTradeId: 'CT-9102-K',
    youtubeLink: 'https://youtu.be/PVjbDGkFrDw'
  },
  {
    id: '2', name: 'P4 Provider',
    avatar: 'https://raw.githubusercontent.com/stocks9610-ops/Stocks-Analysis/new-launch/public/images/3.jpeg',
    roi: 195.4, drawdown: 2.8, followers: 600000, weeks: 104, strategy: 'Finance Fundamentals',
    type: 'Trader', experienceYears: 8, markets: ['Forex', 'Crypto'], riskScore: 2,
    winRate: 84.3, avgDuration: '1 week', riskMethods: ['Fundamental Analysis', 'Trend Confirmation'],
    bio: 'P4 Provider is a professional Forex and Crypto trader with over 8 years of experience. He has mentored 3,300+ traders and shares practical trading strategies, market analysis, and risk management techniques through his YouTube channel Risk Free Trade.',
    category: 'crypto',
    copyTradeId: 'CT-4403-P',
    youtubeLink: 'https://youtu.be/0CgD6mDVV_M'
  },
  {
    id: '11', name: 'Binary Edge Pro',
    avatar: 'https://raw.githubusercontent.com/stocks9610-ops/Stocks-Analysis/new-launch/public/images/5.jpeg',
    roi: 275.4, drawdown: 1.2, followers: 85000, weeks: 104, strategy: '60-Second Momentum Scalp',
    type: 'Trader', experienceYears: 5, markets: ['Binary Options', 'Forex'], riskScore: 6,
    winRate: 91.2, avgDuration: '1 minute', riskMethods: ['Momentum Catching', 'Volume Spikes'],
    bio: 'A high-speed binary options specialist focusing on short-term market momentum and candle-stick reversals. Known for delivering rapid growth in binary markets with precision timing.',
    category: 'binary',
    copyTradeId: 'CT-6611-BIN',
    youtubeLink: 'https://youtu.be/-jAP50QgAAY'
  },
  {
    id: '12', name: 'Pocket Master',
    avatar: 'https://raw.githubusercontent.com/stocks9610-ops/Stocks-Analysis/new-launch/public/images/10.jpeg',
    roi: 195.8, drawdown: 2.5, followers: 54000, weeks: 78, strategy: 'Volatility Over-Under',
    type: 'Analyst', experienceYears: 4, markets: ['Binary Options'], riskScore: 5,
    winRate: 88.4, avgDuration: '30 seconds', riskMethods: ['Support Bounce', 'Resistance Rejection'],
    bio: 'Elite binary analyst delivering high-frequency signals based on volatility patterns. Specializes in rapid account scaling using disciplined risk per trade.',
    category: 'binary',
    copyTradeId: 'CT-9912-PM',
    youtubeLink: 'https://www.youtube.com/@thetradernextdoor'
  },
  {
    id: '7', name: 'Traders Paradise Live',
    avatar: 'https://raw.githubusercontent.com/stocks9610-ops/Stocks-Analysis/new-launch/public/images/22.jpeg',
    roi: 185.6, drawdown: 3.8, followers: 94000, weeks: 142, strategy: 'Precision Gold Price Action',
    type: 'Analyst', experienceYears: 8, markets: ['Gold', 'Commodities'], riskScore: 4,
    winRate: 87.2, avgDuration: '4 hours', riskMethods: ['Market Structure', 'Macro Drivers'],
    bio: 'A high-level gold market analyst specializing in precision price action and macro-driven gold movements. Known for disciplined execution and clear market structure analysis, this trader focuses on capital protection while targeting strong, high-probability gold setups.',
    category: 'gold',
    copyTradeId: 'CT-2207-GOLD',
    youtubeLink: 'https://youtu.be/apA_GyhQkxk'
  },
  {
    id: '8', name: 'Trader Nick',
    avatar: 'https://raw.githubusercontent.com/stocks9610-ops/Stocks-Analysis/new-launch/public/images/23.jpeg',
    roi: 265.4, drawdown: 4.8, followers: 158000, weeks: 210, strategy: 'High-Prob Execution Scaling',
    type: 'Trader', experienceYears: 8, markets: ['Forex', 'Crypto'], riskScore: 5,
    winRate: 86.5, avgDuration: '2 hours', riskMethods: ['Strict Discipline', 'Probabilistic Sets'],
    bio: 'Trader Nick is a high-performance crypto and forex trader known for aggressive yet controlled market execution. His strategy targets high-probability setups, fast decision-making, and scalable account growth while maintaining strict risk discipline in volatile markets.',
    category: 'forex',
    copyTradeId: 'CT-1108-NICK',
    youtubeLink: 'https://www.youtube.com/@TraderNick'
  },
  {
    id: '9', name: 'Tani Forex',
    avatar: 'https://raw.githubusercontent.com/stocks9610-ops/Stocks-Analysis/new-launch/public/images/25.jpeg',
    roi: 310.2, drawdown: 4.2, followers: 215000, weeks: 245, strategy: 'Strategic Growth Precision',
    type: 'Trader', experienceYears: 9, markets: ['Forex', 'Crypto'], riskScore: 4,
    winRate: 89.2, avgDuration: '4 hours', riskMethods: ['Disciplined Execution', 'Volatility Control'],
    bio: 'Elite crypto and forex trader delivering explosive market insights with precision execution. Known for identifying high-probability setups and dominating volatile conditions, this trader focuses on strategic growth, disciplined risk control, and maximum performance in both crypto and forex markets.',
    category: 'forex',
    copyTradeId: 'CT-2509-TANI',
    youtubeLink: 'https://www.youtube.com/watch?v=wgyrU6MZTbc'
  }
];

const ALL_TRADERS = [...FALLBACK_TRADERS];

const SocialIcons: React.FC<{ color: string }> = ({ color }) => (
  <div className="flex gap-1.5 mt-1 opacity-60">
    <svg className={`w-2.5 h-2.5 ${color}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.054-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759 6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
    <svg className={`w-2.5 h-2.5 ${color}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.462 8.27l-1.56 7.42c-.116.545-.44.68-.895.425l-2.37-1.75-1.145 1.1c-.125.127-.23.234-.473.234l.17-2.42 4.41-3.98c.19-.17-.04-.26-.297-.09l-5.45 3.43-2.34-.73c-.51-.16-.52-.51.107-.756l9.15-3.53c.42-.15.79.1.663.667z" /></svg>
  </div>
);

interface TraderListProps {
  onCopyClick: (trader: Trader) => void;
  searchTerm?: string;
}

const TraderList: React.FC<TraderListProps> = ({ onCopyClick, searchTerm = '' }) => {
  const [activeCategory, setActiveCategory] = useState<'crypto' | 'binary' | 'gold' | 'forex'>('crypto');
  const [traderProfits, setTraderProfits] = useState<Record<string, number>>({});
  const [liveWinRates, setLiveWinRates] = useState<Record<string, number>>({});
  const [animatingTraders, setAnimatingTraders] = useState<Record<string, boolean>>({});
  const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null);
  const [traders, setTraders] = useState<ExtendedTrader[]>(ALL_TRADERS);
  const [isFirebaseEnabled, setIsFirebaseEnabled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Subscribe to Firebase traders
  useEffect(() => {
    // Check if Firebase is configured
    const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY;

    if (!firebaseApiKey) {
      console.log('Firebase not configured, using fallback data');
      setIsFirebaseEnabled(false);
      return;
    }

    setIsFirebaseEnabled(true);
    console.log('Subscribing to Firebase traders...');

    const unsubscribe = subscribeToTraders(
      (firebaseTraders) => {
        if (firebaseTraders.length > 0) {
          console.log(`Loaded ${firebaseTraders.length} traders from Firebase`);
          setTraders(firebaseTraders as ExtendedTrader[]);
        } else {
          console.log('No traders in Firebase, using fallback data');
          setTraders(ALL_TRADERS);
        }
      },
      (error) => {
        console.error('Firebase subscription error:', error);
        setTraders(ALL_TRADERS);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const initialProfits: Record<string, number> = {};
    const initialWinRates: Record<string, number> = {};

    traders.forEach(t => {
      const baseProfit = t.id === '0' ? 245000.00 : 5000.00;
      initialProfits[t.id] = baseProfit + Math.random() * 45000;
      initialWinRates[t.id] = t.winRate;
    });

    setTraderProfits(initialProfits);
    setLiveWinRates(initialWinRates);

    const updateInterval = setInterval(() => {
      const filtered = traders.filter(t => t.category === activeCategory);
      if (filtered.length === 0) return;
      const randomIdx = Math.floor(Math.random() * filtered.length);
      const trader = filtered[randomIdx];

      const baseIncrement = trader.id === '0' ? 850 : 250;
      const increment = baseIncrement + Math.random() * 1250;
      const winRateFluctuation = (Math.random() - 0.5) * 0.4;

      setTraderProfits(prev => ({ ...prev, [trader.id]: prev[trader.id] + increment }));
      setLiveWinRates(prev => ({
        ...prev,
        [trader.id]: Math.min(100, Math.max(50, prev[trader.id] + winRateFluctuation))
      }));

      setAnimatingTraders(prev => ({ ...prev, [trader.id]: true }));
      setTimeout(() => setAnimatingTraders(prev => ({ ...prev, [trader.id]: false })), 400);
    }, 1200);

    return () => clearInterval(updateInterval);
  }, [activeCategory, traders]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const getCategoryStyles = (cat: string) => {
    const base = "px-6 md:px-8 py-3 md:py-4 rounded-2xl font-black text-[9px] md:text-xs uppercase tracking-[0.2em] transition-all transform hover:-translate-y-1 active:scale-95 border-2";
    if (activeCategory !== cat && !searchTerm) {
      return `${base} bg-[#1e222d] text-gray-400 border-[#2a2e39] hover:border-gray-500 hover:text-white`;
    }
    // Dim categories if searching
    if (searchTerm && activeCategory !== cat) {
      return `${base} opacity-50 bg-[#1e222d] text-gray-600 border-[#2a2e39] cursor-not-allowed`;
    }

    switch (cat) {
      case 'crypto': return `${base} bg-[#f01a64] text-white border-[#f01a64] shadow-[0_10px_30px_rgba(240,26,100,0.3)]`;
      case 'binary': return `${base} bg-blue-600 text-white border-blue-600 shadow-[0_10px_30px_rgba(37,99,235,0.3)]`;
      case 'gold': return `${base} bg-yellow-500 text-black border-yellow-500 shadow-[0_10px_30px_rgba(234,179,8,0.3)]`;
      case 'forex': return `${base} bg-emerald-600 text-white border-emerald-600 shadow-[0_10px_30_rgba(5,150,105,0.3)]`;
      default: return base;
    }
  };

  const filteredTraders = traders.filter(t => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return t.name.toLowerCase().includes(term) || t.strategy.toLowerCase().includes(term);
    }
    return t.category === activeCategory;
  });

  return (
    <section className="py-16 md:py-28 bg-[#131722] border-t border-[#2a2e39] relative">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10 md:mb-16 space-y-4 md:space-y-6">
          <h2 className="text-3xl md:text-7xl font-black tracking-tighter uppercase italic leading-none bg-gradient-to-b from-white to-gray-500 text-transparent bg-clip-text drop-shadow-2xl px-2">
            Top Traders From The World
          </h2>

          <p className="max-w-3xl mx-auto text-xs md:text-lg text-gray-400 font-medium leading-relaxed px-4">
            Copy trading lets you automatically follow experienced traders. Choose a trader based on verified performance and trade <span className="text-[#00b36b] font-bold">risk-free</span> with our C-Level expert strategies.
          </p>

          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-8">
            {(['crypto', 'binary', 'gold', 'forex'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => !searchTerm && setActiveCategory(cat)}
                className={getCategoryStyles(cat)}
                disabled={!!searchTerm}
              >
                {cat}
              </button>
            ))}
          </div>
          {searchTerm && (
            <div className="text-center animate-in fade-in">
              <span className="text-[10px] text-[#f01a64] font-black uppercase tracking-[0.2em] bg-[#f01a64]/10 px-3 py-1 rounded-lg">
                Showing results for "{searchTerm}" ({filteredTraders.length})
              </span>
            </div>
          )}
        </div>

        <div className="relative group/list">
          <button
            onClick={scrollLeft}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 bg-black/50 hover:bg-[#f01a64] rounded-full items-center justify-center text-white backdrop-blur-md border border-white/10 shadow-xl transition-all opacity-0 group-hover/list:opacity-100 hover:scale-110"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
          </button>

          <button
            onClick={scrollRight}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 bg-black/50 hover:bg-[#f01a64] rounded-full items-center justify-center text-white backdrop-blur-md border border-white/10 shadow-xl transition-all opacity-0 group-hover/list:opacity-100 hover:scale-110"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
          </button>

          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-4 md:gap-6 py-4 px-1 no-scrollbar snap-x snap-mandatory scroll-smooth"
          >
            {filteredTraders.length > 0 ? (
              filteredTraders.map(trader => (
                <div
                  key={trader.id}
                  onClick={() => setSelectedTrader(trader)}
                  className={`min-w-[88vw] sm:min-w-[320px] md:min-w-[340px] bg-[#1e222d] border border-[#2a2e39] rounded-[2.5rem] p-6 cursor-pointer transition-all snap-center relative group hover:border-[#f01a64]/50 hover:shadow-2xl ${animatingTraders[trader.id] ? 'border-[#f01a64] scale-[1.01]' : ''
                    }`}
                >
                  <div className="flex flex-col items-center text-center mb-5">
                    <div className="relative mb-4">
                      <img loading="lazy" src={trader.avatar} className="w-16 h-16 md:w-20 md:h-20 rounded-3xl object-cover ring-2 ring-white/5 bg-[#131722]" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00b36b] border-2 border-[#1e222d] rounded-full"></div>

                      {trader.youtubeLink && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(trader.youtubeLink, '_blank');
                          }}
                          className="absolute -top-2 -left-2 w-8 h-8 bg-[#FF0000] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,0,0,0.6)] animate-pulse border border-white/20 hover:scale-125 transition-transform"
                          title="Watch External Strategy"
                        >
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="min-w-0 w-full">
                      <h3 className="text-white font-black text-base md:text-lg truncate mb-0.5 group-hover:text-[#f01a64] transition-colors">{trader.name}</h3>
                      <span className="text-[7px] text-gray-500 font-black uppercase tracking-[0.3em] block mb-2">{trader.copyTradeId}</span>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-[8px] bg-[#f01a64]/10 text-[#f01a64] px-2 py-0.5 rounded font-black uppercase tracking-widest">{trader.type}</span>
                        <SocialIcons color="text-gray-500" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#131722] p-5 rounded-3xl mb-5 border border-[#2a2e39] group-hover:border-white/10 transition-colors">
                    <div className="flex justify-between items-end mb-1 px-1">
                      <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Total Profits</span>
                      <span className="text-[8px] text-[#00b36b] font-black uppercase tracking-widest animate-pulse">Live</span>
                    </div>
                    <div className={`text-2xl md:text-3xl font-black tracking-tight text-center ${animatingTraders[trader.id] ? 'text-[#00b36b]' : 'text-white'}`}>
                      ${traderProfits[trader.id]?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="bg-[#131722] p-2 rounded-2xl border border-[#2a2e39] text-center">
                      <span className="text-[7px] text-gray-500 uppercase font-black block mb-0.5">ROI</span>
                      <span className="text-[#00b36b] font-black text-xs">+{trader.roi}%</span>
                    </div>
                    <div className={`bg-[#131722] p-2 rounded-2xl border border-[#2a2e39] text-center ${animatingTraders[trader.id] ? 'bg-[#00b36b]/5' : ''} transition-colors`}>
                      <span className="text-[7px] text-gray-500 uppercase font-black block mb-0.5">Win Rate</span>
                      <span className="text-[#00b36b] font-black text-xs">
                        {(liveWinRates[trader.id] || trader.winRate).toFixed(1)}%
                      </span>
                    </div>
                    <div className="bg-[#131722] p-2 rounded-2xl border border-[#2a2e39] text-center">
                      <span className="text-[7px] text-gray-500 uppercase font-black block mb-0.5">Weeks</span>
                      <span className="text-blue-500 font-black text-xs">{trader.weeks}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {trader.youtubeLink && (
                      <button
                        className="w-full py-3.5 bg-[#FF0000]/10 border border-[#FF0000]/30 hover:bg-[#FF0000]/20 text-white rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] shadow-lg transform transition active:scale-90 flex items-center justify-center gap-2"
                        onClick={(e) => { e.stopPropagation(); window.open(trader.youtubeLink, '_blank'); }}
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z" />
                        </svg>
                        Watch Official Strategy
                      </button>
                    )}
                    <button
                      className="w-full py-4 bg-[#00b36b] hover:bg-green-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg transform transition active:scale-90 group-hover:shadow-[#00b36b]/20"
                      onClick={(e) => { e.stopPropagation(); onCopyClick(trader); }}
                    >
                      Copy Strategy
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 text-center py-12 bg-[#1e222d] rounded-[2.5rem] border border-white/5 mx-4">
                <div className="w-16 h-16 bg-[#f01a64]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#f01a64]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-white font-black uppercase text-lg mb-2">No Traders Found</h3>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Try adjusting your search terms</p>
              </div>
            )}
          </div>

          <div className="flex md:hidden justify-center mt-6 gap-2 opacity-50">
            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
            <span className="text-[8px] text-gray-400 uppercase font-black tracking-widest ml-2">Swipe to explore</span>
          </div>
        </div>
      </div>

      {selectedTrader && (
        <TraderProfileModal
          trader={selectedTrader}
          currentProfit={traderProfits[selectedTrader.id]}
          currentWinRate={liveWinRates[selectedTrader.id]}
          onClose={() => setSelectedTrader(null)}
          onCopyClick={() => onCopyClick(selectedTrader)}
        />
      )}
    </section>
  );
};

export default TraderList;