import { storage } from '../firebase.config';
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';

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
        const snapshot = await uploadBytes(storageRef, file, { contentType: file.type });

        // Get download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};

/**
 * Purge specific folders in Storage (DANGER: Admin tool)
 */
export const purgeStorage = async (folderPath: string): Promise<void> => {
    try {
        const folderRef = ref(storage, folderPath);
        const listResult = await listAll(folderRef);

        // Delete all files in this folder
        const deletePromises = listResult.items.map(item => deleteObject(item));

        // Recursively delete subfolders
        const subfolderPromises = listResult.prefixes.map(prefix => purgeStorage(prefix.fullPath));

        await Promise.all([...deletePromises, ...subfolderPromises]);
        console.log(`✅ Purged storage folder: ${folderPath}`);
    } catch (error) {
        console.error(`Error purging storage folder ${folderPath}:`, error);
        throw error;
    }
};
