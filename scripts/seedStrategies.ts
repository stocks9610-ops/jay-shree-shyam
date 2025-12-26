

import { db } from './firebase.node.config';
import { collection, addDoc, getDocs, query, where, writeBatch, doc } from 'firebase/firestore';

const STRATEGIES_COLLECTION = 'strategies';

const INITIAL_STRATEGIES = [
    {
        order: 1,
        name: 'Instant Copy Plan',
        tag: 'Limited Slots',
        hook: 'Copy winning traders instantly',
        duration: '30 Seconds',
        durationMs: 30000,
        minRet: 20,
        maxRet: 25,
        risk: 'Secure',
        minInvest: 500,
        vip: false,
        isActive: true
    },
    {
        order: 2,
        name: 'Auto-Profit Stream',
        tag: 'High Demand',
        hook: 'No experience needed — just copy profits',
        duration: '1 Minute',
        durationMs: 60000,
        minRet: 30,
        maxRet: 40,
        risk: 'Secure',
        minInvest: 1000,
        vip: false,
        isActive: true
    },
    {
        order: 3,
        name: 'VIP Alpha Bridge',
        tag: 'Elite Access',
        hook: 'Follow top traders and earn automatically',
        duration: '5 Minutes',
        durationMs: 300000,
        minRet: 60,
        maxRet: 80,
        risk: 'Sovereign',
        minInvest: 2500,
        vip: true,
        isActive: true
    },
    {
        order: 4,
        name: 'Pro-Market Core',
        tag: 'Global Flow',
        hook: 'Mirror expert trades in real time',
        duration: '1 Hour',
        durationMs: 3600000,
        minRet: 120,
        maxRet: 150,
        risk: 'Sovereign',
        minInvest: 5000,
        vip: true,
        isActive: true
    },
    {
        order: 5,
        name: 'Whale Wealth Path',
        tag: 'Whale Only',
        hook: 'Let professionals trade for you',
        duration: '4 Hours',
        durationMs: 14400000,
        minRet: 300,
        maxRet: 400,
        risk: 'Whale Tier',
        minInvest: 10000,
        vip: true,
        isActive: true
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
