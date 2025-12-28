import {
    collection,
    addDoc,
    doc,
    updateDoc,
    getDocs,
    query,
    where,
    orderBy,
    Timestamp
} from 'firebase/firestore';
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
        return docRef.id;
    } catch (error) {
        console.error('Error creating deposit:', error);
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
    } catch (error) {
        console.error('Error rejecting deposit:', error);
        throw error;
    }
};
