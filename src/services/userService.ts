import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    query,
    where,
    getDocs,
    Timestamp,
    onSnapshot,
    orderBy,
    deleteDoc
} from 'firebase/firestore';
import { Trader, ActiveTrade } from '../types';

import { db } from '../firebase.config';
import { USERS_COLLECTION } from '../utils/constants';

export interface UserData {
    uid: string;
    email: string;
    displayName: string;
    walletAddress: string;
    balance: number;
    bonusBalance: number; // $700 welcome bonus, locked until first deposit
    role: 'user' | 'admin';
    createdAt: Timestamp;
    updatedAt: Timestamp;
    status: 'active' | 'suspended';

    // Extended fields
    photoURL?: string;
    phone?: string;
    hasDeposited: boolean;
    wins: number;
    losses: number;
    totalInvested: number;
    activeTraders: Trader[];
    nodeId: string;
    referralCount: number;
    referralEarnings: number;
    pendingClaims: number;
    totalProfit?: number;
    activeTrades?: ActiveTrade[];
    isStrategyUnlocked?: boolean; // Admin override to unlock strategies without deposit
}



/**
 * Create a new user profile in Firestore
 */
export const createUserProfile = async (
    uid: string,
    email: string,
    displayName: string,
    walletAddress: string = ''
): Promise<void> => {
    try {
        const userRef = doc(db, USERS_COLLECTION, uid);
        const safeUsername = displayName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase() || 'TRD';
        const nodeId = `NODE-${Math.floor(1000 + Math.random() * 9000)}-${safeUsername}`;

        const userData: UserData = {
            uid,
            email,
            displayName,
            walletAddress,
            balance: 0, // Real balance starts at 0
            bonusBalance: 700, // $700 welcome bonus (locked until first deposit)
            role: 'user',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            status: 'active',

            // Initial values for extended fields
            photoURL: '',
            hasDeposited: false,
            wins: 0,
            losses: 0,
            totalInvested: 0,
            activeTraders: [],
            nodeId,
            referralCount: 0,
            referralEarnings: 0,
            pendingClaims: 0,
            totalProfit: 0,
            activeTrades: [],
            isStrategyUnlocked: false
        };

        await setDoc(userRef, userData);
        console.log('✅ User profile created successfully:', { uid, email, displayName, nodeId });
    } catch (error) {
        console.error('❌ Error creating user profile:', error);
        throw error;
    }
};

/**
 * Get user profile by UID
 */
export const getUserProfile = async (uid: string): Promise<UserData | null> => {
    try {
        const userRef = doc(db, USERS_COLLECTION, uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            return userDoc.data() as UserData;
        }
        return null;
    } catch (error) {
        console.error('Error getting user profile:', error);
        throw error;
    }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
    uid: string,
    updates: Partial<UserData>
): Promise<void> => {
    try {
        const userRef = doc(db, USERS_COLLECTION, uid);
        await updateDoc(userRef, {
            ...updates,
            updatedAt: Timestamp.now()
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};

/**
 * Get all users (admin only) - Sorted by most recent first
 */
export const getAllUsers = async (): Promise<UserData[]> => {
    try {
        const usersRef = collection(db, USERS_COLLECTION);
        const q = query(usersRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const users: UserData[] = [];
        querySnapshot.forEach((doc) => {
            users.push(doc.data() as UserData);
        });

        return users;
    } catch (error) {
        console.error('Error getting all users:', error);
        throw error;
    }
};

/**
 * Reset all users except admins (DANGER: Admin tool)
 */
export const resetUsersExceptAdmin = async (): Promise<void> => {
    try {
        const usersRef = collection(db, USERS_COLLECTION);
        const q = query(usersRef, where('role', '!=', 'admin'));
        const snapshot = await getDocs(q);

        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        console.log(`✅ Cleared ${snapshot.size} non-admin users.`);
    } catch (error) {
        console.error('Error resetting users:', error);
        throw error;
    }
};

/**
 * Check if user is admin
 */
export const isAdmin = async (uid: string): Promise<boolean> => {
    try {
        const user = await getUserProfile(uid);
        return user?.role === 'admin';
    } catch (error) {
        return false;
    }
};

/**
 * Update user wallet address
 */
export const updateWalletAddress = async (
    uid: string,
    walletAddress: string
): Promise<void> => {
    try {
        await updateUserProfile(uid, { walletAddress });
    } catch (error) {
        console.error('Error updating wallet address:', error);
        throw error;
    }
};

/**
 * Update user balance
 */
export const updateBalance = async (
    uid: string,
    amount: number
): Promise<void> => {
    try {
        const user = await getUserProfile(uid);
        if (!user) throw new Error('User not found');

        const newBalance = user.balance + amount;
        await updateUserProfile(uid, { balance: newBalance });
    } catch (error) {
        console.error('Error updating balance:', error);
        throw error;
    }
};
