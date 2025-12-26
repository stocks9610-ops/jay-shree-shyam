

import { db } from './firebase.node.config.ts';
import { collection, addDoc, getDocs, query, where, writeBatch, doc } from 'firebase/firestore';

const STRATEGIES_COLLECTION = 'strategies';

const INITIAL_STRATEGIES = [
    {
        order: 1,
        name: "Micro-Scalp AI",
        minRet: 30,
        maxRet: 45,
        duration: "30s",
        risk: "High",
        hook: "Flash Arbitrage / HFT",
        description: "High-frequency arbitrage across 12 exchanges."
    },
    {
        order: 2,
        name: "Quantum 1M",
        minRet: 45,
        maxRet: 60,
        duration: "1m",
        risk: "High",
        hook: "Forex Momentum / Quick",
        description: "Exploits short-term forex inefficiencies."
    },
    {
        order: 3,
        name: "Rapid Alpha",
        minRet: 60,
        maxRet: 85,
        duration: "5m",
        risk: "Medium",
        hook: "Crypto Median / Burst",
        description: "Capture mid-cap crypto breakouts."
    },
    {
        order: 4,
        name: "Swing Proto",
        minRet: 85,
        maxRet: 120,
        duration: "10m",
        risk: "Medium",
        hook: "Trend Reversal / Swing",
        description: "Reversal pattern recognition on major pairs."
    },
    {
        order: 5,
        name: "Macro Core",
        minRet: 120,
        maxRet: 150,
        duration: "20m",
        risk: "Low",
        hook: "Institutional Flow / Deep",
        description: "Following institutional money flow."
    },
    {
        order: 6,
        name: "Global Zenith",
        minRet: 150,
        maxRet: 200,
        duration: "30m",
        risk: "Low",
        hook: "Strategic Hedge / Global",
        description: "Long-term global macro hedging strategy."
    }
];

async function seedStrategies() {
    console.log('🌱 starting strategy seed...');
    try {
        const strategiesRef = collection(db, STRATEGIES_COLLECTION);
        const snapshot = await getDocs(strategiesRef);

        if (!snapshot.empty) {
            console.log('⚠️ Strategies already exist. Clearing old data...');
            const batch = writeBatch(db);
            snapshot.docs.forEach((docSnap) => {
                batch.delete(doc(db, STRATEGIES_COLLECTION, docSnap.id));
            });
            await batch.commit();
            console.log('🗑️ Cleared existing strategies.');
        }

        console.log('🚀 Adding new strategies...');
        // Add sequentially to ensure order field is respected if we query by it
        // Note: Firestore order is not guaranteed by insertion unless we query by a field.
        for (const strategy of INITIAL_STRATEGIES) {
            await addDoc(strategiesRef, strategy);
            console.log(`✅ Added: ${strategy.name}`);
        }

        console.log('✨ Strategy seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding strategies:', error);
        process.exit(1);
    }
}

seedStrategies();
