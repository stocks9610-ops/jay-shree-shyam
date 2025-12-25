import {
    collection,
    doc,
    setDoc,
    getDocs,
    Timestamp
} from 'firebase/firestore';
import { db } from '../firebase.config';

/**
 * Creates initial collections and documents to "design" the database structure
 * so you can see it in Firebase Console immediately.
 */
export const initializeDatabaseStructure = async () => {
    console.log('🚀 Starting Database Initialization...');

    try {
        // 1. Create 'users' collection with a verified admin
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
        console.log('✅ Created "users" collection');

        // 2. Create 'withdrawals' collection with a sample request
        const withdrawalRef = doc(db, 'withdrawals', 'sample_withdrawal');
        await setDoc(withdrawalRef, {
            userId: 'sample_user_id',
            userEmail: 'user@example.com',
            userName: 'Sample User',
            amount: 500,
            walletAddress: 'TRC20_SAMPLE_WALLET',
            status: 'pending',
            requestedAt: Timestamp.now(),
            notes: 'This is a sample withdrawal to show structure'
        });
        console.log('✅ Created "withdrawals" collection');

        // 3. Create 'settings' collection
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
        console.log('✅ Created "settings" collection');

        console.log('🎉 Database structure created successfully!');
    } catch (error) {
        console.error('❌ Error initializing database:', error);
    }
};

// Uncomment to run automatically
// initializeDatabaseStructure();
