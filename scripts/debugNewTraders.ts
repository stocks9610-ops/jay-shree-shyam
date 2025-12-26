import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as dotenv from 'dotenv';

dotenv.config();

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

async function debugNewestTraders() {
    console.log('--- Debugging ALL Traders (looking for recent ones) ---');
    try {
        const tradersRef = collection(db, 'traders');
        const snapshot = await getDocs(tradersRef);

        // Sort in memory since one database index might be missing
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

        // Sort logic: use createdAt if available, otherwise fallback
        // We want to see the ones that might be "new"
        console.log(`Total Traders: ${docs.length}`);

        docs.forEach((trader: any) => {
            console.log(`\nID: ${trader.id}`);
            console.log(`Name: ${trader.name}`);
            console.log(`Category: '${trader.category}'`);
            console.log(`Strategy: '${trader.strategy}'`);
            console.log(`CreatedAt: ${trader.createdAt ? JSON.stringify(trader.createdAt) : 'MISSING'}`);
            // Check fields that might break the UI if missing
            console.log(`Required Fields Present: ` +
                `Bio:${!!trader.bio}, ` +
                `WinRate:${trader.winRate}, ` +
                `ROI:${trader.roi}, ` +
                `Weeks:${trader.weeks}, ` +
                `Type:${trader.type}`
            );
        });

    } catch (error) {
        console.error('❌ Error fetching:', error);
    }
}

debugNewestTraders();
