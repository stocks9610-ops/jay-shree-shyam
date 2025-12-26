
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
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

const verify = async () => {
    console.log('🔍 Verifying Firestore Data...');

    // Check Traders
    const tradersRef = collection(db, 'traders');
    const tradersSnap = await getDocs(tradersRef);
    console.log(`✅ Traders found: ${tradersSnap.size}`);
    tradersSnap.docs.forEach(d => console.log(`   - ${d.data().name} (${d.data().category})`));

    // Check Segments
    const segmentsRef = collection(db, 'segments');
    const segmentsSnap = await getDocs(query(segmentsRef, orderBy('order')));
    console.log(`✅ Segments found: ${segmentsSnap.size}`);
    segmentsSnap.docs.forEach(d => console.log(`   - ${d.data().label}`));

    // Check Payment Methods
    const pmRef = collection(db, 'payment_methods');
    const pmSnap = await getDocs(pmRef);
    console.log(`✅ Payment Methods found: ${pmSnap.size}`);
    pmSnap.docs.forEach(d => console.log(`   - ${d.data().name}`));

    if (tradersSnap.size > 0 && segmentsSnap.size > 0) {
        console.log('\n🎉 VERIFICATION SUCCESS: All collections are populated and accessible.');
    } else {
        console.error('\n❌ VERIFICATION FAILED: Missing data.');
        process.exit(1);
    }
    process.exit(0);
};

verify();
