// Migration script to upload existing trader data to Firebase
// Run this once after setting up Firebase credentials

import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase.config';

interface ExtendedTrader {
    id: string;
    name: string;
    avatar: string;
    roi: number;
    drawdown: number;
    followers: number;
    weeks: number;
    strategy: string;
    type: 'Trader' | 'Analyst' | 'Educator';
    experienceYears: number;
    markets: string[];
    riskScore: number;
    winRate: number;
    avgDuration: string;
    riskMethods: string[];
    bio: string;
    category: 'crypto' | 'binary' | 'gold' | 'forex';
    copyTradeId: string;
    youtubeLink?: string;
}

const INITIAL_TRADERS: ExtendedTrader[] = [
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

export const migrateTraders = async () => {
    console.log('🚀 Starting trader migration to Firebase...');

    try {
        const tradersRef = collection(db, 'traders');
        let successCount = 0;
        let errorCount = 0;

        for (const trader of INITIAL_TRADERS) {
            try {
                // Remove the 'id' field as Firebase will auto-generate it
                const { id, ...traderData } = trader;

                await addDoc(tradersRef, {
                    ...traderData,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                });

                successCount++;
                console.log(`✅ Migrated: ${trader.name}`);
            } catch (error) {
                errorCount++;
                console.error(`❌ Failed to migrate ${trader.name}:`, error);
            }
        }

        console.log('\n📊 Migration Summary:');
        console.log(`✅ Success: ${successCount}`);
        console.log(`❌ Failed: ${errorCount}`);
        console.log(`📈 Total: ${INITIAL_TRADERS.length}`);

        if (successCount === INITIAL_TRADERS.length) {
            console.log('\n🎉 Migration completed successfully!');
        }
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
};

// Uncomment to run migration
migrateTraders();
