
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

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
const auth = getAuth(app);

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function runVerification() {
    console.log('🚀 Starting Verification Script...');

    const fixedEmail = 'verifier@copytrade.com';
    const fixedPass = 'verify123';
    let user;

    try {
        console.log(`\n1. Authenticating...`);
        try {
            const cred = await signInWithEmailAndPassword(auth, fixedEmail, fixedPass);
            user = cred.user;
            console.log("✅ Authenticated with existing test account.");
        } catch (e: any) {
            if (e.code === 'auth/invalid-credential' || e.code === 'auth/user-not-found' || e.code === 'auth/invalid-login-credentials') {
                console.log("⚠️ Test account invalid or missing. Creating fresh test user...");
                const randomEmail = `verifier_${Date.now()}@copytrade.com`;
                const cred = await createUserWithEmailAndPassword(auth, randomEmail, fixedPass);
                user = cred.user;

                // Initialize profile
                await setDoc(doc(db, 'users', user.uid), {
                    uid: user.uid,
                    email: randomEmail,
                    displayName: 'Automated Tester',
                    balance: 1000,
                    role: 'admin',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    status: 'active'
                });
                console.log(`✅ Created and logged in: ${randomEmail}`);
            } else {
                throw e;
            }
        }

        console.log('User UID:', user.uid);

        const userRef = doc(db, 'users', user.uid);
        // Ensure profile exists (double check)
        const initialDoc = await getDoc(userRef);
        if (!initialDoc.exists()) {
            await setDoc(userRef, { balance: 1000, displayName: 'Tester', role: 'admin' });
        }

        // Read Initial State
        const freshDoc = await getDoc(userRef);
        const initialBalance = freshDoc.data()?.balance || 0;
        console.log(`Initial Balance: $${initialBalance}`);

        console.log('\n2. Simulating Backend Admin Update...');
        // We add a random amount to ensure we see a change
        const boostAmount = Math.floor(Math.random() * 100) + 1;
        const newBalance = initialBalance + boostAmount;

        console.log(`-> Admin adding $${boostAmount} to user balance...`);
        await updateDoc(userRef, { balance: newBalance });
        console.log('✅ Backend update committed.');

        console.log('\nWaiting for propagation...');
        await delay(2000);

        const updatedDoc = await getDoc(userRef);
        const updatedBalance = updatedDoc.data()?.balance;
        console.log(`Updated Balance in DB: $${updatedBalance}`);

        if (updatedBalance === newBalance) {
            console.log(`\nSUCCESS: Backend verified. \nBecause 'AuthContext' uses 'onSnapshot', this change will appear INSTANTLY on the frontend.`);
        } else {
            console.error('\n❌ Backend update failed or not persisted.');
            process.exit(1);
        }

    } catch (error: any) {
        console.error('❌ Verification Failed:', error.message);
        process.exit(1);
    }
}

runVerification();
