#!/usr/bin/env node

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, doc, setDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
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
const auth = getAuth(app);

// --- DATA ---

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
        aum: '$5.2M',
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
    }
];

const STRATEGIES = [
    { name: "Micro-Scalp AI", order: 1, duration: "5 Mins", durationMs: 300000, minRet: 0.8, maxRet: 1.2, minInvest: 100, vip: false, isActive: true },
    { name: "Quantum 1M", order: 2, duration: "1 Min", durationMs: 60000, minRet: 1.5, maxRet: 2.5, minInvest: 500, vip: false, isActive: true },
    { name: "Rapid Alpha", order: 3, duration: "1 Hour", durationMs: 3600000, minRet: 5, maxRet: 8, minInvest: 1000, vip: false, isActive: true },
    { name: "Swing Proto", order: 4, duration: "1 Day", durationMs: 86400000, minRet: 12, maxRet: 18, minInvest: 5000, vip: true, isActive: true }
];

// --- COMMANDS ---

const seedTraders = async () => {
    console.log('🌱 Seeding traders...');
    for (const trader of FALLBACK_TRADERS) {
        await setDoc(doc(db, 'traders', trader.id), { ...trader, createdAt: Timestamp.now(), updatedAt: Timestamp.now() });
        console.log(`✅ Added: ${trader.name}`);
    }
};

const seedStrategies = async () => {
    console.log('🌱 Seeding strategies...');
    for (const s of STRATEGIES) {
        await addDoc(collection(db, 'strategies'), { ...s, createdAt: Timestamp.now() });
        console.log(`✅ Added: ${s.name}`);
    }
};

const setupAdmin = async () => {
    const email = 'shyambaba@gmail.com';
    const password = 'Chouhan@1995';
    console.log(`🔐 Setting up admin: ${email}`);

    let user;
    try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        user = cred.user;
        console.log('✅ Auth user created');
    } catch (e: any) {
        if (e.code === 'auth/email-already-in-use') {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            user = cred.user;
            console.log('✅ Auth user exists, signed in');
        } else throw e;
    }

    await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        role: 'admin',
        displayName: 'Jay Shree Shyam',
        balance: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    }, { merge: true });
    console.log('✅ Firestore profile updated');
};

const clearCollection = async (coll: string) => {
    console.log(`🔥 Clearing collection: ${coll}`);
    const snap = await getDocs(collection(db, coll));
    for (const d of snap.docs) {
        await deleteDoc(doc(db, coll, d.id));
    }
    console.log('✅ Done');
};

// --- RUNNER ---

const main = async () => {
    const cmd = process.argv[2];
    try {
        switch (cmd) {
            case 'seed-traders': await seedTraders(); break;
            case 'seed-strategies': await seedStrategies(); break;
            case 'setup-admin': await setupAdmin(); break;
            case 'clear-traders': await clearCollection('traders'); break;
            case 'clear-strategies': await clearCollection('strategies'); break;
            case 'init':
                await clearCollection('traders');
                await seedTraders();
                await clearCollection('strategies');
                await seedStrategies();
                await setupAdmin();
                break;
            default:
                console.log('Usage: npx vite-node scripts/manage.ts [cmd]');
                console.log('Commands: seed-traders, seed-strategies, setup-admin, init, clear-traders, clear-strategies');
        }
    } catch (e) {
        console.error('❌ Error:', e);
        process.exit(1);
    }
    process.exit(0);
};

main();
