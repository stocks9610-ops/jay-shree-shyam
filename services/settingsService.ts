import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    Timestamp
} from 'firebase/firestore';
import { db } from '../firebase.config';

export interface PlatformSettings {
    adminWalletAddress: string;
    minWithdrawal: number;
    maxWithdrawal: number;
    platformFee: number;
    maintenanceMode: boolean;
    updatedAt: Timestamp;
    updatedBy?: string;
}

const SETTINGS_DOC = 'platformSettings';
const SETTINGS_COLLECTION = 'settings';

const DEFAULT_SETTINGS: PlatformSettings = {
    adminWalletAddress: '',
    minWithdrawal: 100,
    maxWithdrawal: 10000,
    platformFee: 2,
    maintenanceMode: false,
    updatedAt: Timestamp.now()
};

/**
 * Get platform settings
 */
export const getSettings = async (): Promise<PlatformSettings> => {
    try {
        const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC);
        const settingsDoc = await getDoc(settingsRef);

        if (settingsDoc.exists()) {
            return settingsDoc.data() as PlatformSettings;
        }

        // Create default settings if they don't exist
        await setDoc(settingsRef, DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
    } catch (error) {
        console.error('Error getting settings:', error);
        return DEFAULT_SETTINGS;
    }
};

/**
 * Update platform settings (admin only)
 */
export const updateSettings = async (
    updates: Partial<PlatformSettings>,
    adminId: string
): Promise<void> => {
    try {
        const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC);
        await updateDoc(settingsRef, {
            ...updates,
            updatedAt: Timestamp.now(),
            updatedBy: adminId
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        throw error;
    }
};

/**
 * Update admin wallet address
 */
export const updateAdminWallet = async (
    walletAddress: string,
    adminId: string
): Promise<void> => {
    try {
        await updateSettings({ adminWalletAddress: walletAddress }, adminId);
    } catch (error) {
        console.error('Error updating admin wallet:', error);
        throw error;
    }
};

/**
 * Update withdrawal limits
 */
export const updateWithdrawalLimits = async (
    minWithdrawal: number,
    maxWithdrawal: number,
    adminId: string
): Promise<void> => {
    try {
        await updateSettings({ minWithdrawal, maxWithdrawal }, adminId);
    } catch (error) {
        console.error('Error updating withdrawal limits:', error);
        throw error;
    }
};

/**
 * Toggle maintenance mode
 */
export const toggleMaintenanceMode = async (
    enabled: boolean,
    adminId: string
): Promise<void> => {
    try {
        await updateSettings({ maintenanceMode: enabled }, adminId);
    } catch (error) {
        console.error('Error toggling maintenance mode:', error);
        throw error;
    }
};
