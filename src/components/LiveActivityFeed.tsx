import React, { useState, useEffect } from 'react';

// LOCALIZED BOT DATA (Gulf / South Asia Focus) - 50 Identities
const NAMES = [
  'Zain Malik', 'Fatima Al-Sayed', 'Ahmed Khan', 'Raj Patel', 'Sarah Jones',
  'Bilal Hassan', 'Ayesha Siddiqui', 'Hamza Tariq', 'Priya Sharma', 'David Miller',
  'Omar Farooq', 'Layla Mahmoud', 'Vikram Singh', 'John Smith', 'Huda Kattan',
  'Usman Ali', 'Maria Garcia', 'Sana Mir', 'Amit Kumar', 'Elena Petrov',
  'Youssef Ibrahim', 'Noor Jahan', 'Rahul Gupta', 'Chris Taylor', 'Sophie Lee',
  // Expanded
  'Fahad Al-Rasheed', 'Nadia Hussain', 'Mustafa Kemal', 'Arjun Reddy', 'Linda Wilson',
  'Tariq Jameel', 'Mehwish Hayat', 'Ravi Shankar', 'James Bond', 'Anna Weber',
  'Khalid bin Walid', 'Zoya Akhtar', 'Imran Nazir', 'Deepak Chopra', 'Michael Ross',
  'Salma Hayek', 'Babur Azam', 'Kareena Kapoor', 'Steve Jobs', 'Natalia V.',
  'Hassan Sheheryar', 'Mahira Khan', 'Virat Kohli', 'Tom Cruise', 'Olga Kurylenko'
];

const LOCATIONS = [
  'Dubai, UAE', 'Karachi, PK', 'Islamabad, PK', 'Riyadh, SA', 'Doha, QA',
  'Lahore, PK', 'Abu Dhabi, UAE', 'Mumbai, IN', 'London, UK', 'New York, USA',
  'Sharjah, UAE', 'Jeddah, SA', 'Manama, BH', 'Kuwait City, KW', 'Muscat, OM'
];

const ASSETS = [
  { symbol: 'USDT', name: 'Tether (TRC20)', icon: 'T' },
  { symbol: 'BTC', name: 'Bitcoin', icon: '₿' },
  { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ' },
  { symbol: 'XRP', name: 'Ripple', icon: 'X' },
  { symbol: 'BNB', name: 'BNB Smart Chain', icon: 'B' }
];

const ACTIONS = [
  { type: 'withdraw', text: 'withdrew', color: 'text-amber-500', glow: 'shadow-amber-500/20', bg: 'bg-amber-500' },
  { type: 'trade', text: 'profited', color: 'text-[#00b36b]', glow: 'shadow-[#00b36b]/20', bg: 'bg-[#00b36b]' },
  { type: 'deposit', text: 'deposited', color: 'text-blue-500', glow: 'shadow-blue-500/20', bg: 'bg-blue-500' }
];

const LiveActivityFeed: React.FC = () => {
  const [notification, setNotification] = useState<{
    name: string,
    location: string,
    action: typeof ACTIONS[0],
    amount: string,
    asset: string,
    time: string,
    id: string
  } | null>(null);

  const [visible, setVisible] = useState(false);

  // Helper: Get Time in UTC+5 (Islamabad/Karachi)
  const getSimulatedTime = () => {
    // 80% chance of "Just now", 20% chance of "1m ago" to look organic
    return Math.random() > 0.8 ? "1m ago" : "Just now";
  };

  useEffect(() => {
    const initialTimer = setTimeout(() => triggerNotification(), 2000);
    const loop = setInterval(() => {
      triggerNotification();
    }, Math.random() * 6000 + 8000); // 8-14 seconds gap (Not too spammy)

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
      const assetObj = ASSETS[Math.floor(Math.random() * ASSETS.length)];

      // HIGH VALUE LOGIC ($5k - $50k)
      // 10% chance of small amount ($500-$2000)
      // 90% chance of big amount
      let baseAmount = 0;
      if (Math.random() > 0.9) {
        baseAmount = Math.random() * 1500 + 500;
      } else {
        baseAmount = Math.random() * 45000 + 5000;
      }

      // Adjust for Asset Price (Rough check)
      let displayAmount = "";
      if (assetObj.symbol === 'BTC') {
        displayAmount = (baseAmount / 65000).toFixed(4) + " BTC";
      } else if (assetObj.symbol === 'ETH') {
        displayAmount = (baseAmount / 3500).toFixed(2) + " ETH";
      } else {
        displayAmount = baseAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " " + assetObj.symbol;
      }

      setNotification({
        id: Math.random().toString(36).substr(2, 9),
        name,
        location,
        action: actionObj,
        amount: displayAmount,
        asset: assetObj.name,
        time: getSimulatedTime()
      });
      setVisible(true);

      setTimeout(() => setVisible(false), 5000);
    }, 600);
  };

  if (!notification) return null;

  return (
    // Position: Bottom-Left on Desktop, Top-Center (Toast) on Mobile
    <div
      className={`fixed z-[110] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform
        bottom-24 left-4 md:bottom-10 md:left-10 
        ${visible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-90 blur-sm'}
      `}
    >
      <div className="relative group max-w-[90vw] md:max-w-none mx-auto">
        {/* Pulse Ring Effect */}
        <div className={`absolute -inset-1 rounded-[1.2rem] blur-xl opacity-20 transition-colors duration-500 ${notification.action.bg}`}></div>

        <div className="relative w-auto md:w-[320px] bg-[#1e222d]/80 backdrop-blur-2xl border border-white/10 rounded-[1.2rem] p-3 md:p-4 shadow-2xl overflow-hidden flex gap-3 items-center">
          {/* Subtle top light effect */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

          {/* Icon */}
          <div className="relative shrink-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-inner relative z-10 ${notification.action.bg}`}>
              {notification.name.split(' ')[0][0]}{notification.name.split(' ')[1] ? notification.name.split(' ')[1][0] : ''}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[9px] text-gray-300 font-bold truncate mr-2">
                {notification.name} <span className="text-gray-500 text-[8px] uppercase tracking-wide ml-1">{notification.location}</span>
              </span>
              <span className="text-[7px] text-gray-600 font-bold uppercase tracking-tighter shrink-0">
                {notification.time}
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className={`text-[10px] uppercase font-black ${notification.action.color}`}>{notification.action.text}</span>
                <span className="text-white font-black font-mono text-sm tracking-tight">{notification.amount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveActivityFeed;