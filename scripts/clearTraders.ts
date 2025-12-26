
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables correctly
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

// Check if config is loaded
if (!firebaseConfig.apiKey) {
    console.error('❌ Error: Firebase config not found. Make sure .env variable exist.');
    process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const clearTraders = async () => {
    console.log('Starting trader cleanup...');
    try {
        const tradersRef = collection(db, 'traders');
        const snapshot = await getDocs(tradersRef);

        if (snapshot.empty) {
            console.log('No traders found to delete.');
            return;
        }

        console.log(`Found ${snapshot.size} traders. Deleting...`);

        // Batch delete is better for many docs, but simple loop works for small datasets
        const deletePromises = snapshot.docs.map((document) =>
            deleteDoc(doc(db, 'traders', document.id))
        );

        await Promise.all(deletePromises);
        console.log('✅ All traders deleted successfully.');
    } catch (error) {
        console.error('❌ Error clearing traders:', error);
    }
};

clearTraders();
