import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

console.log('🔌 Connecting to Firebase project:', firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const initializeDatabaseStructure = async () => {
    console.log('🚀 Starting Database Initialization...');

    try {
        // 1. Create 'users' collection with a verified admin
        console.log('👤 Creating Admin User...');
        const adminRef = doc(db, 'users', 'admin_placeholder');
        await setDoc(adminRef, {
            uid: 'admin_placeholder',
            email: 'admin@example.com',
            displayName: 'System Admin',
            walletAddress: 'TRC20_ADMIN_WALLET',
            balance: 10000,
            role: 'admin',
            status: 'active',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });

        // 2. Create 'withdrawals' collection
        console.log('💸 Creating Withdrawals Collection...');
        const withdrawalRef = doc(db, 'withdrawals', 'sample_withdrawal');
        await setDoc(withdrawalRef, {
            userId: 'sample_user_id',
            userEmail: 'user@example.com',
            userName: 'Sample User',
            amount: 500,
            walletAddress: 'TRC20_SAMPLE_WALLET',
            status: 'pending',
            requestedAt: Timestamp.now(),
            notes: 'Sample withdrawal to visualize structure'
        });

        // 3. Create 'settings' collection
        console.log('⚙️ Creating Settings Collection...');
        const settingsRef = doc(db, 'settings', 'platformSettings');
        await setDoc(settingsRef, {
            adminWalletAddress: 'TRC20_YOUR_ADMIN_WALLET',
            minWithdrawal: 100,
            maxWithdrawal: 10000,
            platformFee: 2,
            maintenanceMode: false,
            updatedAt: Timestamp.now(),
            updatedBy: 'system'
        });

        // 4. Create 'traders' collection (Sample Data)
        console.log('📈 Creating Traders Collection...');
        const traderRef = doc(db, 'traders', 'trader_sample_1');
        await setDoc(traderRef, {
            id: 'trader_sample_1',
            name: "Sarah Jenkins",
            handle: "@sarah_crypto",
            riskScore: 3,
            winRate: 88.5,
            totalReturn: 452.30,
            followers: 1250,
            minCapital: 500,
            description: "Conservative swing trader focusing on BTC and ETH major moves.",
            avatar: "https://randomuser.me/api/portraits/women/44.jpg"
        });

        console.log('✅ DATABASE INITIALIZATION COMPLETE!');
        console.log('👉 Go to Firebase Console > Firestore to see your data.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error initializing database:', error);
        process.exit(1);
    }
};

initializeDatabaseStructure();
