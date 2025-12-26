
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, doc, setDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars
dotenv.config({ path: resolve(__dirname, '../.env') });

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const FALLBACK_TRADERS = [
    {
        id: '0',
        name: 'Anas Ali (Elite Signal)',
        avatar: 'https://raw.githubusercontent.com/stocks9610-ops/Stocks-Analysis/new-launch/public/images/1.jpeg',
        roi: 342.5, drawdown: 3.2, followers: 185000, weeks: 156, strategy: 'Signal & Mindset Architecture',
        type: 'Educator', experienceYears: 6, markets: ['Crypto', 'Signals'], riskScore: 3,
        winRate: 88.5, avgDuration: '1 day', riskMethods: ['Mindset Control', 'Risk Awareness'],
        bio: 'Anas Ali is a fast-growing forex and crypto trader known for high-accuracy Risk Free trade signals and bold market execution. He leads one of Asia\'s largest trading communities and focuses on disciplined strategies, consistency, and profit-driven trading.',
        category: 'crypto',
        copyTradeId: 'CT-7701-X',
        youtubeLink: 'https://www.youtube.com/watch?v=dvQzEIbJlw4',
        isTrending: true,
        aum: '$5.2M', // Mock data
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
        youtubeLink: 'https://www.youtube.com/channel/UCFSn-h8wTnhpKJMteN76Abg',
        isTrending: true,
        aum: '$12.5M'
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
        youtubeLink: 'https://youtu.be/PVjbDGkFrDw',
        isTrending: false,
        aum: '$8.1M'
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
        youtubeLink: 'https://youtu.be/0CgD6mDVV_M',
        isTrending: false,
        aum: '$3.4M'
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
        youtubeLink: 'https://youtu.be/-jAP50QgAAY',
        isTrending: true,
        aum: '$1.2M'
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
        youtubeLink: 'https://www.youtube.com/@thetradernextdoor',
        isTrending: false,
        aum: '$900K'
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
        youtubeLink: 'https://youtu.be/apA_GyhQkxk',
        isTrending: true,
        aum: '$4.5M'
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
        youtubeLink: 'https://www.youtube.com/@TraderNick',
        isTrending: false,
        aum: '$3.1M'
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
        youtubeLink: 'https://www.youtube.com/watch?v=wgyrU6MZTbc',
        isTrending: true,
        aum: '$6.8M'
    }
];

const seedTraders = async () => {
    console.log('🌱 Starting traders seeding...');
    const tradersRef = collection(db, 'traders');

    // Check if traders already exist
    const snapshot = await getDocs(tradersRef);
    if (!snapshot.empty) {
        console.log('⚠️ Traders collection is not empty. Skipping seed to prevent duplicates.');
        // Optional: logic to update existing?
        process.exit(0);
    }

    try {
        for (const trader of FALLBACK_TRADERS) {
            // Using setDoc with specific ID if possible, but fallback traders ids are simple numbers string '0', '10'. 
            // Better to let Firestore generate IDs OR use the ID from the file?
            // Fallback Ids are used for unique keys in frontend. Let's try to preserve them if they are good, 
            // but mapped to a clean string. Let's just add them as fields and let Firestore make the Document ID.
            // OR use the ID as the document ID for consistency?

            // NOTE: The ID '0' is used in frontend logic for special animating values. We should preserve it as the ID.

            const docRef = doc(db, 'traders', trader.id);
            await setDoc(docRef, {
                ...trader,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log(`✅ Added trader: ${trader.name}`);
        }
        console.log('🎉 Traders seeding completed successfully!');
    } catch (error) {
        console.error('❌ Error seeding traders:', error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
};

seedTraders();
