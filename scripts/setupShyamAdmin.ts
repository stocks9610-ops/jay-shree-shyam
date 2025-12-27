#!/usr/bin/env node

/**
 * Admin User Setup Script - Non-Interactive
 * Creates the admin user with specified credentials
 * Credentials: shyambaba@gmail.com / Chouhan@1995
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
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

// Admin credentials - Jay Shree Shyam
const ADMIN_CREDENTIALS = {
    email: 'shyambaba@gmail.com',
    password: 'Chouhan@1995',
    displayName: 'Jay Shree Shyam'
};

console.log('\n🔌 Connecting to Firebase project:', firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const createAdminUser = async () => {
    console.log('\n🔐 ADMIN USER SETUP - Jay Shree Shyam\n');

    try {
        let user;
        let isNewUser = false;

        // Try to create new user first
        try {
            console.log('🚀 Creating admin user...');
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                ADMIN_CREDENTIALS.email,
                ADMIN_CREDENTIALS.password
            );
            user = userCredential.user;
            isNewUser = true;
            console.log('✅ New admin user created in Firebase Auth');
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                console.log('📋 User already exists, signing in to update role...');
                const userCredential = await signInWithEmailAndPassword(
                    auth,
                    ADMIN_CREDENTIALS.email,
                    ADMIN_CREDENTIALS.password
                );
                user = userCredential.user;
                console.log('✅ Signed in to existing account');
            } else {
                throw error;
            }
        }

        console.log('   UID:', user.uid);
        console.log('   Email:', user.email);

        // Check if profile exists
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            // Update existing profile to admin
            await updateDoc(userRef, {
                role: 'admin',
                displayName: ADMIN_CREDENTIALS.displayName,
                updatedAt: Timestamp.now()
            });
            console.log('✅ Updated existing profile to admin role');
        } else {
            // Create new admin profile
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: ADMIN_CREDENTIALS.displayName,
                walletAddress: '',
                balance: 0,
                bonusBalance: 0,
                role: 'admin',
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                status: 'active',
                hasDeposited: false,
                wins: 0,
                losses: 0,
                totalInvested: 0,
                activeTraders: [],
                nodeId: 'NODE-ADMIN-SHYAM',
                referralCount: 0,
                referralEarnings: 0,
                pendingClaims: 0,
                totalProfit: 0
            });
            console.log('✅ Admin profile created in Firestore');
        }

        console.log('\n🎉 SUCCESS! Admin user is ready!');
        console.log('\n📝 Login Credentials:');
        console.log('   Email:', ADMIN_CREDENTIALS.email);
        console.log('   Password:', ADMIN_CREDENTIALS.password);
        console.log('\n🔗 Access admin panel at: /secure-access-shyam');
        console.log('\n⚠️  IMPORTANT: Keep these credentials safe!');

        process.exit(0);
    } catch (error: any) {
        console.error('\n❌ Error:', error.message);
        console.error('   Code:', error.code);
        process.exit(1);
    }
};

createAdminUser();
