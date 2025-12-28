import {
    collection,
    doc,
    addDoc,
    updateDoc,
    getDocs,
    query,
    where,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { WITHDRAWALS_COLLECTION } from '../utils/constants';

export interface Withdrawal {
    id?: string;
    userId: string;
    userEmail: string;
    userName: string;
    amount: number;
    walletAddress: string;
    network: string; // e.g., TRC20, BEP20, ERC20
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: Timestamp;
    processedAt?: Timestamp;
    processedBy?: string;
    notes?: string;
}



/**
 * Create a new withdrawal request
 */
export const createWithdrawal = async (
    userId: string,
    userEmail: string,
    userName: string,
    amount: number,
    walletAddress: string,
    network: string
): Promise<string> => {
    try {
        const withdrawalData: Omit<Withdrawal, 'id'> = {
            userId,
            userEmail,
            userName,
            amount,
            walletAddress,
            network,
            status: 'pending',
            requestedAt: Timestamp.now()
        };

        const docRef = await addDoc(collection(db, WITHDRAWALS_COLLECTION), withdrawalData);
        return docRef.id;
    } catch (error) {
        console.error('Error creating withdrawal:', error);
        throw error;
    }
};

/**
 * Get all withdrawals for a user
 */
export const getUserWithdrawals = async (userId: string): Promise<Withdrawal[]> => {
    try {
        const q = query(
            collection(db, WITHDRAWALS_COLLECTION),
            where('userId', '==', userId)
            // orderBy('requestedAt', 'desc') 
        );

        const querySnapshot = await getDocs(q);
        const withdrawals: Withdrawal[] = [];

        querySnapshot.forEach((doc) => {
            withdrawals.push({ id: doc.id, ...doc.data() } as Withdrawal);
        });

        // Sort manually in client with safety
        return withdrawals.sort((a, b) => {
            const timeA = a.requestedAt?.toMillis() || 0;
            const timeB = b.requestedAt?.toMillis() || 0;
            return timeB - timeA;
        });
    } catch (error) {
        console.error('Error getting user withdrawals:', error);
        throw error;
    }
};

/**
 * Get all pending withdrawals (admin only)
 */
export const getPendingWithdrawals = async (): Promise<Withdrawal[]> => {
    try {
        const q = query(
            collection(db, WITHDRAWALS_COLLECTION),
            where('status', '==', 'pending')
            // orderBy('requestedAt', 'asc')
        );

        const querySnapshot = await getDocs(q);
        const withdrawals: Withdrawal[] = [];

        querySnapshot.forEach((doc) => {
            withdrawals.push({ id: doc.id, ...doc.data() } as Withdrawal);
        });

        return withdrawals.sort((a, b) => {
            const timeA = a.requestedAt?.toMillis() || 0;
            const timeB = b.requestedAt?.toMillis() || 0;
            return timeA - timeB;
        });
    } catch (error) {
        console.error('Error getting pending withdrawals:', error);
        throw error;
    }
};

/**
 * Get all withdrawals (admin only)
 */
export const getAllWithdrawals = async (): Promise<Withdrawal[]> => {
    try {
        const q = query(
            collection(db, WITHDRAWALS_COLLECTION)
            // orderBy('requestedAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const withdrawals: Withdrawal[] = [];

        querySnapshot.forEach((doc) => {
            withdrawals.push({ id: doc.id, ...doc.data() } as Withdrawal);
        });

        return withdrawals;
    } catch (error) {
        console.error('Error getting all withdrawals:', error);
        throw error;
    }
};

/**
 * Approve a withdrawal request
 */
export const approveWithdrawal = async (
    withdrawalId: string,
    adminId: string,
    notes?: string
): Promise<void> => {
    try {
        const withdrawalRef = doc(db, WITHDRAWALS_COLLECTION, withdrawalId);
        await updateDoc(withdrawalRef, {
            status: 'approved',
            processedAt: Timestamp.now(),
            processedBy: adminId,
            notes: notes || ''
        });
    } catch (error) {
        console.error('Error approving withdrawal:', error);
        throw error;
    }
};

/**
 * Reject a withdrawal request
 */
export const rejectWithdrawal = async (
    withdrawalId: string,
    adminId: string,
    notes: string
): Promise<void> => {
    try {
        const withdrawalRef = doc(db, WITHDRAWALS_COLLECTION, withdrawalId);
        await updateDoc(withdrawalRef, {
            status: 'rejected',
            processedAt: Timestamp.now(),
            processedBy: adminId,
            notes
        });
    } catch (error) {
        console.error('Error rejecting withdrawal:', error);
        throw error;
    }
};

/**
 * Get withdrawal statistics
 */
export const getWithdrawalStats = async (): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    totalAmount: number;
}> => {
    try {
        const withdrawals = await getAllWithdrawals();

        const stats = {
            total: withdrawals.length,
            pending: withdrawals.filter(w => w.status === 'pending').length,
            approved: withdrawals.filter(w => w.status === 'approved').length,
            rejected: withdrawals.filter(w => w.status === 'rejected').length,
            totalAmount: withdrawals
                .filter(w => w.status === 'approved')
                .reduce((sum, w) => sum + w.amount, 0)
        };

        return stats;
    } catch (error) {
        console.error('Error getting withdrawal stats:', error);
        throw error;
    }
};
