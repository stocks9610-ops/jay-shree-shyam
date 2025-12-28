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
    onSnapshot
} from 'firebase/firestore';
import { Trader } from '../types';

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
            totalProfit: 0
        };

        await setDoc(userRef, userData);
    } catch (error) {
        console.error('Error creating user profile:', error);
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
 * Get all users (admin only)
 */
export const getAllUsers = async (): Promise<UserData[]> => {
    try {
        const usersRef = collection(db, USERS_COLLECTION);
        const querySnapshot = await getDocs(usersRef);

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
