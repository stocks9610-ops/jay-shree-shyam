// Migration script to upload existing trader data to Firebase
// Run this once after setting up Firebase credentials

import {
    collection,
    addDoc,
    Timestamp,
    getDocs,
    writeBatch,
    doc
} from 'firebase/firestore';
import { db } from '../src/firebase.config';
import { getAuth } from 'firebase/auth';

import { INITIAL_TRADERS, ExtendedTrader } from './data/initialTraders';

export const migrateTraders = async () => {
    // Wait for auth to be ready
    const auth = getAuth();

    return new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                console.log('🚀 User logged in, starting migration check...');
                try {
                    const tradersRef = collection(db, 'traders');
                    const snapshot = await getDocs(tradersRef);

                    if (snapshot.empty) {
                        console.log('📦 No traders found in Firebase. Starting migration...');
                        const batch = writeBatch(db);

                        INITIAL_TRADERS.forEach((trader) => {
                            const newDocRef = doc(tradersRef, trader.id);
                            // Ensure numeric values are stored as numbers
                            const traderData = {
                                ...trader,
                                riskScore: Number(trader.riskScore),
                                winRate: Number(trader.winRate),
                                followers: Number(trader.followers),
                                minCapital: Number(trader.minCapital || 500),
                                totalReturn: Number(trader.roi || trader.totalReturn || 0),
                                // Default description if missing
                                description: trader.bio || `Expert trader with ${trader.winRate}% win rate.`,
                                avatar: trader.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${trader.id}`,
                                createdAt: Timestamp.now(), // Add createdAt
                                updatedAt: Timestamp.now() // Add updatedAt
                            };
                            batch.set(newDocRef, traderData);
                        });

                        await batch.commit();
                        console.log('✅ Specific traders migrated to Firebase successfully!');
                    } else {
                        console.log('✨ Traders already exist in Firebase. accessible count:', snapshot.size);
                    }
                } catch (error) {
                    console.error('❌ Error migrating traders:', error);
                } finally {
                    unsubscribe(); // Unsubscribe after check/migration
                }
            } else {
                console.log('⏳ Waiting for user login to perform migration...');
            }
            resolve(true);
        });
    });
};

// Uncomment to run migration
// migrateTraders();
