#!/usr/bin/env node

/**
 * Admin User Setup Script
 * Creates the first admin user in Firebase Auth and Firestore
 * Run this once to bootstrap your admin access
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import * as readline from 'readline';

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
const auth = getAuth(app);
const db = getFirestore(app);

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query: string): Promise<string> => {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
};

const createAdminUser = async () => {
    console.log('\n🔐 ADMIN USER SETUP\n');
    console.log('This script will create your first admin user.\n');

    try {
        // Get admin details
        const email = await question('Enter admin email: ');
        const password = await question('Enter admin password (min 6 chars): ');
        const displayName = await question('Enter admin display name: ');

        if (!email || !password || password.length < 6) {
            console.error('❌ Invalid input. Email and password (min 6 chars) are required.');
            process.exit(1);
        }

        console.log('\n🚀 Creating admin user...');

        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log('✅ Admin user created in Firebase Auth');
        console.log('   UID:', user.uid);
        console.log('   Email:', user.email);

        // Create admin profile in Firestore
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: displayName || 'Admin',
            walletAddress: '',
            balance: 0,
            role: 'admin', // 👈 This is the key!
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            status: 'active'
        });

        console.log('✅ Admin profile created in Firestore');
        console.log('   Role: admin');
        console.log('   Status: active');

        console.log('\n🎉 SUCCESS! Admin user created successfully!');
        console.log('\n📝 Login Credentials:');
        console.log('   Email:', email);
        console.log('   Password: [hidden]');
        console.log('\n🔗 Access admin panel at: /admin');
        console.log('\n⚠️  IMPORTANT: Save these credentials securely!');

        process.exit(0);
    } catch (error: any) {
        console.error('\n❌ Error creating admin user:', error.message);

        if (error.code === 'auth/email-already-in-use') {
            console.log('\n💡 This email is already registered.');
            console.log('   If you need to make this user an admin, update their role in Firestore:');
            console.log('   1. Go to Firebase Console > Firestore');
            console.log('   2. Find the user in the "users" collection');
            console.log('   3. Set "role" field to "admin"');
        }

        process.exit(1);
    } finally {
        rl.close();
    }
};

createAdminUser();
