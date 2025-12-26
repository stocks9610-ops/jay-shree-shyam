
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';
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

const DEFAULT_SEGMENTS = [
    { key: 'crypto', label: 'Crypto', order: 1, color: '#f01a64' },
    { key: 'binary', label: 'Binary', order: 2, color: '#2563eb' },
    { key: 'gold', label: 'Gold', order: 3, color: '#eab308' },
    { key: 'forex', label: 'Forex', order: 4, color: '#059669' }
];

const DEFAULT_PAYMENT_METHODS = [
    {
        name: 'USDT (TRC20)',
        address: 'TUg2...', // Placeholder, admin should update
        network: 'TRON',
        isActive: true,
        qrCode: ''
    },
    {
        name: 'Bitcoin (BTC)',
        address: 'bc1...', // Placeholder
        network: 'Bitcoin',
        isActive: true,
        qrCode: ''
    }
];

const seedConfig = async () => {
    console.log('🌱 Starting config seeding...');

    // Seed Segments
    const segmentsRef = collection(db, 'segments');
    const segSnap = await getDocs(segmentsRef);
    if (segSnap.empty) {
        console.log('Creating segments...');
        for (const seg of DEFAULT_SEGMENTS) {
            await addDoc(segmentsRef, seg);
        }
        console.log('✅ Segments created');
    } else {
        console.log('⚠️ Segments already exist');
    }

    // Seed Payment Methods
    const pmRef = collection(db, 'payment_methods');
    const pmSnap = await getDocs(pmRef);
    if (pmSnap.empty) {
        console.log('Creating payment methods...');
        for (const pm of DEFAULT_PAYMENT_METHODS) {
            await addDoc(pmRef, pm);
        }
        console.log('✅ Payment methods created');
    } else {
        console.log('⚠️ Payment methods already exist');
    }

    process.exit(0);
};

seedConfig();
