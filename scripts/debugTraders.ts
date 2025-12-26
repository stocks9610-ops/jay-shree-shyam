import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as dotenv from 'dotenv';

// Load env vars
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

async function debugTraders() {
    console.log('--- Debugging Traders ---');
    try {
        const tradersRef = collection(db, 'traders');
        const snapshot = await getDocs(tradersRef);

        if (snapshot.empty) {
            console.log('❌ NO TRADERS FOUND IN FIRESTORE COLLECTION "traders"');
            return;
        }

        console.log(`✅ Found ${snapshot.size} traders.`);
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            console.log(`ID: ${doc.id}`);
            console.log(`   Name: "${data.name}"`);
            console.log(`   Category: "${data.category}" (Type: ${typeof data.category})`);
            console.log(`   Strategy: "${data.strategy}"`);
            console.log('---------------------------');
        });
    } catch (error) {
        console.error('❌ Error fetching:', error);
    }
}

debugTraders();
