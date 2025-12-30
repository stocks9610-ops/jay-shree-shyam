import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    updateDoc,
    deleteDoc,
    doc,
    Timestamp,
    getDocs
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { NOTIFICATIONS_COLLECTION } from '../utils/constants';

export interface UserNotification {
    id?: string;
    userId: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'alert';
    isRead: boolean;
    createdAt: Timestamp;
}

/**
 * Send a notification to a specific user
 */
export const sendNotification = async (
    userId: string,
    title: string,
    message: string,
    type: UserNotification['type'] = 'info'
): Promise<string> => {
    try {
        const notification: Omit<UserNotification, 'id'> = {
            userId,
            title,
            message,
            type,
            isRead: false,
            createdAt: Timestamp.now()
        };

        const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), notification);
        return docRef.id;
    } catch (error) {
        console.error('Error sending notification:', error);
        throw error;
    }
};

/**
 * Get all notifications for a user (real-time)
 */
export const subscribeToNotifications = (
    userId: string,
    callback: (notifications: UserNotification[]) => void
) => {
    const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const notifications: UserNotification[] = [];
        snapshot.forEach((doc) => {
            notifications.push({ id: doc.id, ...doc.data() } as UserNotification);
        });
        callback(notifications);
    });
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (notificationId: string): Promise<void> => {
    try {
        const docRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
        await updateDoc(docRef, { isRead: true });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId: string): Promise<void> => {
    try {
        const docRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw error;
    }
};

/**
 * Clear all notifications for a user (Reset tool)
 */
export const clearUserNotifications = async (userId: string): Promise<void> => {
    try {
        const q = query(collection(db, NOTIFICATIONS_COLLECTION), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
    } catch (error) {
        console.error('Error clearing notifications:', error);
        throw error;
    }
};

/**
 * Clear ALL notifications (Hard System Reset)
 */
export const clearAllNotifications = async (): Promise<void> => {
    try {
        const snapshot = await getDocs(collection(db, NOTIFICATIONS_COLLECTION));
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
    } catch (error) {
        console.error('Error clearing all notifications:', error);
        throw error;
    }
};
