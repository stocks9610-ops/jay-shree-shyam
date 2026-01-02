import {
    collection,
    addDoc,
    doc,
    updateDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    Timestamp,
    deleteDoc
} from 'firebase/firestore';
import { storage } from '../firebase.config';
import { ref, deleteObject } from 'firebase/storage';
import { db } from '../firebase.config';
import { USERS_COLLECTION, DEPOSITS_COLLECTION } from '../utils/constants';

export interface Deposit {
    id?: string;
    userId: string;
    userName: string;
    userEmail: string;
    amount: number;
    network: string; // TRC20, ERC20, etc.
    proofUrl: string; // URL to the image 
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: Timestamp;
    processedAt?: Timestamp;
    processedBy?: string;
    notes?: string;
}

/**
 * Create a new deposit request
 */
export const createDeposit = async (
    userId: string,
    userName: string,
    userEmail: string,
    amount: number,
    network: string,
    proofUrl: string
): Promise<string> => {
    try {
        const depositData: Omit<Deposit, 'id'> = {
            userId,
            userName,
            userEmail,
            amount,
            network,
            proofUrl,
            status: 'pending',
            requestedAt: Timestamp.now()
        };

        const docRef = await addDoc(collection(db, DEPOSITS_COLLECTION), depositData);
        console.log('✅ Deposit created successfully:', {
            depositId: docRef.id,
            userId,
            userName,
            amount,
            network
        });
        return docRef.id;
    } catch (error) {
        console.error('❌ Error creating deposit:', error);
        throw error;
    }
};

/**
 * Get pending deposits (Admin)
 */
export const getPendingDeposits = async (): Promise<Deposit[]> => {
    try {
        const q = query(
            collection(db, DEPOSITS_COLLECTION),
            where('status', '==', 'pending')
        );

        const snapshot = await getDocs(q);
        const deposits: Deposit[] = [];
        snapshot.forEach(doc => {
            deposits.push({ id: doc.id, ...doc.data() } as Deposit);
        });

        return deposits.sort((a, b) => {
            const timeA = a.requestedAt?.toMillis() || 0;
            const timeB = b.requestedAt?.toMillis() || 0;
            return timeB - timeA;
        });
    } catch (error) {
        console.error('Error getting pending deposits:', error);
        return [];
    }
};

/**
 * Approve deposit
 * Updates deposit status AND user balance
 */
export const approveDeposit = async (
    depositId: string,
    userId: string,
    amount: number,
    adminId: string
): Promise<void> => {
    try {
        // 1. Update Deposit Status
        const depositRef = doc(db, DEPOSITS_COLLECTION, depositId);
        await updateDoc(depositRef, {
            status: 'approved',
            processedAt: Timestamp.now(),
            processedBy: adminId
        });

        // 2. Credit User Balance
        const userRef = doc(db, USERS_COLLECTION, userId);
        const { increment } = await import('firebase/firestore');
        await updateDoc(userRef, {
            balance: increment(amount),
            hasDeposited: true
        });

        // 3. Clear Proof (Privacy/Storage focus)
        const depositSnap = await getDoc(depositRef);
        const depositData = depositSnap.data() as Deposit;

        if (depositData?.proofUrl && depositData.proofUrl.startsWith('https://firebasestorage')) {
            try {
                const proofRef = ref(storage, depositData.proofUrl);
                await deleteObject(proofRef);
                console.log('✅ Proof image deleted from Storage');
            } catch (err) {
                console.warn('Could not delete proof image from storage:', err);
            }
        }

        // Always clear the URL in Firestore to save space/privacy
        await updateDoc(depositRef, { proofUrl: '' });

    } catch (error) {
        console.error('Error approving deposit:', error);
        throw error;
    }
};

/**
 * Reject deposit
 */
export const rejectDeposit = async (
    depositId: string,
    adminId: string,
    notes: string
): Promise<void> => {
    try {
        const depositRef = doc(db, DEPOSITS_COLLECTION, depositId);
        await updateDoc(depositRef, {
            status: 'rejected',
            processedAt: Timestamp.now(),
            processedBy: adminId,
            notes
        });

        // Clear Proof
        const depositSnap = await getDoc(depositRef);
        const depositData = depositSnap.data() as Deposit;

        if (depositData?.proofUrl && depositData.proofUrl.startsWith('https://firebasestorage')) {
            try {
                const proofRef = ref(storage, depositData.proofUrl);
                await deleteObject(proofRef);
            } catch (err) {
                console.warn('Could not delete proof image:', err);
            }
        }
        await updateDoc(depositRef, { proofUrl: '' });

    } catch (error) {
        console.error('Error rejecting deposit:', error);
        throw error;
    }
};

/**
 * Clear all deposits (DANGER: Admin tool)
 */
export const clearAllDeposits = async (): Promise<void> => {
    try {
        const snap = await getDocs(collection(db, DEPOSITS_COLLECTION));
        const deletePromises = snap.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        console.log(`✅ Cleared ${snap.size} deposits.`);
    } catch (error) {
        console.error('Error clearing deposits:', error);
        throw error;
    }
};
