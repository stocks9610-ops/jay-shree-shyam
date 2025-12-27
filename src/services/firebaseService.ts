import {
    collection,
    getDocs,
    doc,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy,
    Timestamp,
    QuerySnapshot,
    DocumentData
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { PaymentMethod, TradingSegment, Trader } from '../types';

// Use Trader type directly as it now includes category
export type FirebaseTrader = Trader;

// Collection reference
const TRADERS_COLLECTION = 'traders';

/**
 * Fetch all traders from Firebase
 */
export const getAllTraders = async (): Promise<FirebaseTrader[]> => {
    try {
        const tradersRef = collection(db, TRADERS_COLLECTION);
        const q = query(tradersRef); // orderBy('createdAt', 'desc') removed to prevent index errors temporarily
        const querySnapshot = await getDocs(q);

        const traders: FirebaseTrader[] = [];
        querySnapshot.forEach((doc) => {
            traders.push({ id: doc.id, ...doc.data() } as FirebaseTrader);
        });

        return traders;
    } catch (error) {
        console.error('Error fetching traders:', error);
        throw error;
    }
};

/**
 * Get a single trader by ID
 */
export const getTraderById = async (traderId: string): Promise<FirebaseTrader | null> => {
    try {
        const traderRef = doc(db, TRADERS_COLLECTION, traderId);
        const traderDoc = await getDoc(traderRef);

        if (traderDoc.exists()) {
            return { id: traderDoc.id, ...traderDoc.data() } as FirebaseTrader;
        }
        return null;
    } catch (error) {
        console.error('Error fetching trader:', error);
        throw error;
    }
};

/**
 * Add a new trader to Firebase
 */
export const addTrader = async (trader: Omit<FirebaseTrader, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
        const tradersRef = collection(db, TRADERS_COLLECTION);
        const docRef = await addDoc(tradersRef, {
            ...trader,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });

        return docRef.id;
    } catch (error) {
        console.error('Error adding trader:', error);
        throw error;
    }
};

/**
 * Update an existing trader
 */
export const updateTrader = async (traderId: string, updates: Partial<FirebaseTrader>): Promise<void> => {
    try {
        const traderRef = doc(db, TRADERS_COLLECTION, traderId);
        await updateDoc(traderRef, {
            ...updates,
            updatedAt: Timestamp.now()
        });
    } catch (error) {
        console.error('Error updating trader:', error);
        throw error;
    }
};

/**
 * Delete a trader
 */
export const deleteTrader = async (traderId: string): Promise<void> => {
    try {
        const traderRef = doc(db, TRADERS_COLLECTION, traderId);
        await deleteDoc(traderRef);
    } catch (error) {
        console.error('Error deleting trader:', error);
        throw error;
    }
};

/**
 * Subscribe to real-time trader updates
 */
export const subscribeToTraders = (
    callback: (traders: FirebaseTrader[]) => void,
    onError?: (error: Error) => void
): (() => void) => {
    try {
        const tradersRef = collection(db, TRADERS_COLLECTION);
        const q = query(tradersRef); // orderBy removed to ensure data loads without index

        const unsubscribe = onSnapshot(
            q,
            (querySnapshot: QuerySnapshot<DocumentData>) => {
                const traders: FirebaseTrader[] = [];
                querySnapshot.forEach((doc) => {
                    traders.push({ id: doc.id, ...doc.data() } as FirebaseTrader);
                });
                callback(traders);
            },
            (error) => {
                console.error('Error in traders subscription:', error);
                if (onError) onError(error as Error);
            }
        );

        return unsubscribe;
    } catch (error) {
        console.error('Error setting up subscription:', error);
        throw error;
    }
};

// Fetch all segments
export const getSegments = async (): Promise<TradingSegment[]> => {
    try {
        const segmentsRef = collection(db, 'segments');
        const q = query(segmentsRef, orderBy('order', 'asc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TradingSegment));
    } catch (error) {
        console.error('Error fetching segments:', error);
        return [];
    }
};

// Fetch all payment methods
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
    try {
        const pmRef = collection(db, 'payment_methods');
        // Filter by isActive if needed, or do it in frontend
        const q = query(pmRef);
        const snapshot = await getDocs(q);
        // Map and sort or filter
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentMethod));
    } catch (error) {
        console.error('Error fetching payment methods:', error);
        return [];
    }
};
