
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

export interface Deposit {
    id?: string;
    userId: string;
    userName: string;
    userEmail: string;
    amount: number;
    network: string; // TRC20, ERC20, etc.
    proofUrl: string; // URL to the image (could be base64 for now if not using storage, but better as a storage URL ideally. We will use what the FE gives)
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: Timestamp;
    processedAt?: Timestamp;
    processedBy?: string;
    notes?: string;
}

const DEPOSITS_COLLECTION = 'deposits';

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
            proofUrl, // In real app, upload this to Storage first. For now, it might be base64 from FE.
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
            // orderBy('requestedAt', 'desc') // Requires index usually
        );

        const snapshot = await getDocs(q);
        const deposits: Deposit[] = [];
        snapshot.forEach(doc => {
            deposits.push({ id: doc.id, ...doc.data() } as Deposit);
        });

        // Manual sort to avoid index issues if not deployed
        return deposits.sort((a, b) => b.requestedAt.toMillis() - a.requestedAt.toMillis());
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
        // We import the userService function here to avoid circular dep issues if possible, 
        // or just duplicate the simple update logic. Better to keep it transactional if possible.
        const userRef = doc(db, 'users', userId);
        // We need to read current balance first to increment safely, or use increment().
        // For simplicity reusing the service logic pattern:
        // However, we are in a separate file. Let's do a direct Firestore update for atomicity if we could, but here separate.

        // Note: Ideally use a Transaction. For now, sequential.
        // Importing interactively or assuming user exists.

        // Let's use the userService helper if possible, but to avoid circular imports, we just update doc directly.
        // Use increment for atomic update
        const { increment } = await import('firebase/firestore');
        await updateDoc(userRef, {
            balance: increment(amount),
            totalInvested: increment(0), // Keep fields consistent
            hasDeposited: true
        });

        // We will maintain the balance update in the Controller (UI) or here?
        // Let's do it here to ensure "Approve" = "Money Added".
        // Use importing from userService might cause circular dependency if userService imports this.
        // Checking userService... it doesn't seem to import depositService.

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
