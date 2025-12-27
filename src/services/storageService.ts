import { storage } from '../firebase.config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Uploads an image file to Firebase Storage and returns the public download URL.
 * @param file The file object to upload
 * @param path The path in storage (e.g., 'traders/avatar.jpg')
 */
export const uploadImage = async (file: File, path?: string): Promise<string> => {
    try {
        // Create a reference
        // If no path provided, generate a unique one based on timestamp
        const storagePath = path || `uploads/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, storagePath);

        // Upload the file
        const snapshot = await uploadBytes(storageRef, file);

        // Get download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};
