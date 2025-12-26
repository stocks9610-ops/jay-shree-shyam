import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
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

async function repairTraders() {
    console.log('--- Repairing Traders ---');
    try {
        const tradersRef = collection(db, 'traders');
        const snapshot = await getDocs(tradersRef);

        let repairedCount = 0;

        for (const d of snapshot.docs) {
            const data = d.data();
            const updates: any = {};

            if (!data.category) {
                updates.category = 'crypto';
            }
            if (!data.strategy) {
                updates.strategy = 'Standard Strategy';
            }
            if (!data.type) {
                updates.type = 'Trader';
            }
            if (data.roi === undefined) {
                updates.roi = 0;
            }
            if (data.weeks === undefined) {
                updates.weeks = 1;
            }
            if (data.totalProfit === undefined) {
                updates.totalProfit = 0;
            }

            if (Object.keys(updates).length > 0) {
                console.log(`Fixing ${d.id} (${data.name})...`, updates);
                await updateDoc(doc(db, 'traders', d.id), updates);
                repairedCount++;
            }
        }

        console.log(`✅ Repaired ${repairedCount} traders.`);
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

repairTraders();
