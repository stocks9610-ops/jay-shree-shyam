import React, { useState, useEffect } from 'react';

const NAMES = ['Alex M.', 'Sarah K.', 'David R.', 'Wei L.', 'James B.', 'Maria G.', 'Ahmed H.', 'Elena P.', 'Chris T.', 'Sophie L.'];
const LOCATIONS = ['Johannesburg, ZA', 'Dubai, UAE', 'London, UK', 'New York, USA', 'Singapore, SG', 'Cape Town, ZA', 'Lagos, NG', 'Berlin, DE'];
const ACTIONS = [
  { type: 'withdraw', text: 'extracted', asset: 'USDT (TRC-20)', color: 'text-yellow-500', glow: 'shadow-yellow-500/20', bg: 'bg-yellow-500' },
  { type: 'trade', text: 'realized', asset: 'on BTC/USDT', color: 'text-[#00b36b]', glow: 'shadow-[#00b36b]/20', bg: 'bg-[#00b36b]' },
  { type: 'deposit', text: 'confirmed', asset: 'via Secure Wallet', color: 'text-blue-500', glow: 'shadow-blue-500/20', bg: 'bg-blue-500' }
];

const LiveActivityFeed: React.FC = () => {
  const [notification, setNotification] = useState<{
    name: string, 
    location: string,
    action: typeof ACTIONS[0], 
    amount: string,
    id: string
  } | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const initialTimer = setTimeout(() => triggerNotification(), 3000);
    const loop = setInterval(() => {
      triggerNotification();
    }, Math.random() * 5000 + 7000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(loop);
    };
  }, []);

  const triggerNotification = () => {
    setVisible(false);
    
    setTimeout(() => {
      const name = NAMES[Math.floor(Math.random() * NAMES.length)];
      const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
      const actionObj = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
      
      let amount = 0;
      if (actionObj.type === 'withdraw') amount = Math.floor(Math.random() * 8000) + 1500;
      if (actionObj.type === 'trade') amount = Math.floor(Math.random() * 2000) + 400;
      if (actionObj.type === 'deposit') amount = Math.floor(Math.random() * 5000) + 500;

      setNotification({
        id: Math.random().toString(36).substr(2, 9),
        name,
        location,
        action: actionObj,
        amount: amount.toLocaleString(undefined, { minimumFractionDigits: 2 })
      });
      setVisible(true);

      setTimeout(() => setVisible(false), 5000);
    }, 600);
  };

  if (!notification) return null;

  return (
    <div 
      className={`fixed bottom-36 left-4 md:bottom-10 md:left-10 z-[110] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform pb-[env(safe-area-inset-bottom)] ${
        visible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-90 blur-sm'
      }`}
    >
      <div className="relative group">
        {/* Pulse Ring Effect */}
        <div className={`absolute -inset-1 rounded-[1.5rem] blur-xl opacity-20 transition-colors duration-500 ${notification.action.bg}`}></div>
        
        <div className="relative w-[280px] md:w-[320px] bg-[#1e222d]/70 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-4 shadow-2xl overflow-hidden">
          {/* Subtle top light effect */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          
          <div className="flex gap-4">
            {/* High-End Identicon Icon */}
            <div className="relative shrink-0">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-inner relative z-10 ${notification.action.bg}`}>
                {notification.name.split(' ')[0][0]}{notification.name.split(' ')[1][0]}
              </div>
              {/* Pulse Animation */}
              <div className={`absolute inset-0 rounded-2xl animate-ping opacity-25 ${notification.action.bg}`}></div>
              {/* Verified Badge */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#131722] rounded-full flex items-center justify-center border border-white/10 z-20">
                <svg className="w-3 h-3 text-[#00b36b]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[8px] text-gray-400 font-black uppercase tracking-[0.2em] truncate mr-2">
                  {notification.name} • {notification.location}
                </span>
                <span className="text-[7px] text-[#00b36b] font-mono bg-[#00b36b]/10 px-1.5 py-0.5 rounded uppercase font-black">
                  Verified
                </span>
              </div>
              
              <div className="flex flex-col">
                <p className="text-[10px] text-gray-200 font-medium mb-1">
                  System {notification.action.text}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-xl font-black font-mono leading-none tracking-tight ${notification.action.color}`}>
                    ${notification.amount}
                  </span>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between">
                 <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest truncate">
                   {notification.action.asset}
                 </span>
                 <span className="text-[7px] text-gray-600 font-bold uppercase tracking-tighter">
                   Just now
                 </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveActivityFeed;