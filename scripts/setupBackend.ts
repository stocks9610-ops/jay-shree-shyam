#!/usr/bin/env node

/**
 * Complete Backend Setup Script
 * Runs all necessary setup steps in order:
 * 1. Deploy Firestore rules
 * 2. Migrate traders to Firebase
 * 3. Initialize collections
 * 4. Verify setup
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, doc, Timestamp, setDoc } from 'firebase/firestore';
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

// Trader data from migrateToFirebase.ts
import { INITIAL_TRADERS } from './data/initialTraders';

const setupBackend = async () => {
    console.log('\n🚀 BACKEND SETUP STARTING...\n');

    try {
        // Step 1: Migrate Traders
        console.log('📈 Step 1: Migrating Traders to Firebase...');
        const tradersRef = collection(db, 'traders');
        const tradersSnapshot = await getDocs(tradersRef);

        console.log(`   Found ${tradersSnapshot.size} existing traders.`);
        console.log('   Starting migration/update of core trader data...');

        const batch = writeBatch(db);
        let operationCount = 0;

        INITIAL_TRADERS.forEach((trader) => {
            const newDocRef = doc(tradersRef, trader.id);
            const traderData = {
                ...trader,
                riskScore: Number(trader.riskScore),
                winRate: Number(trader.winRate),
                followers: Number(trader.followers),
                minCapital: Number(trader.minCapital || 500),
                totalReturn: Number(trader.roi || trader.totalReturn || 0),
                description: trader.bio || `Expert trader with ${trader.winRate}% win rate.`,
                updatedAt: Timestamp.now()
                // We don't overwrite createdAt if it exists, but since we are doing a set (upsert), 
                // we might want to be careful. Ideally we would use set with merge, but 
                // for these core seed traders, overwriting ensures our defined data is the source of truth.
                // However, we should preserve createdAt if possible. 
                // For simplicity and robustness of this specific "seed" script, we will just set it.
                // If we want to be nicer, we could check individual existence, but batch set is efficient.
            };

            // To preserve createdAt, we'd need to read it first? No, that's too slow for batch?
            // Actually, let's just use { merge: true } to update fields without destroying other data (like createdAt if it exists).
            // But verify if specific fields need to be enforced.

            batch.set(newDocRef, traderData, { merge: true });
            operationCount++;
        });

        await batch.commit();
        console.log(`   ✅ ${operationCount} traders processed (created or updated) successfully!`);

        // Step 2: Initialize Settings
        console.log('\n⚙️  Step 2: Initializing Platform Settings...');
        const settingsRef = doc(db, 'settings', 'platformSettings');
        await setDoc(settingsRef, {
            adminWalletAddress: 'TRC20_YOUR_ADMIN_WALLET',
            minWithdrawal: 100,
            maxWithdrawal: 10000,
            platformFee: 2,
            maintenanceMode: false,
            updatedAt: Timestamp.now(),
            updatedBy: 'system'
        }, { merge: true });
        console.log('   ✅ Platform settings initialized');

        // Step 3: Verify Collections
        console.log('\n🔍 Step 3: Verifying Collections...');

        const collections = ['traders', 'users', 'withdrawals', 'settings'];
        for (const collectionName of collections) {
            const snapshot = await getDocs(collection(db, collectionName));
            console.log(`   ${collectionName}: ${snapshot.size} documents`);
        }

        console.log('\n✅ BACKEND SETUP COMPLETE!');
        console.log('\n📝 Next Steps:');
        console.log('   1. Run: npm run create-admin (to create admin user)');
        console.log('   2. Deploy Firestore rules: firebase deploy --only firestore:rules');
        console.log('   3. Test admin panel at /admin');
        console.log('\n🎉 Your backend is ready!');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error during setup:', error);
        process.exit(1);
    }
};

setupBackend();
