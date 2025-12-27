import { useState, useCallback } from 'react';
import { uploadImage } from '../services/storageService';

interface UseImageUploadOptions {
    maxSizeBytes?: number;
    allowedTypes?: string[];
    uploadPath?: string;
}

interface UseImageUploadReturn {
    // State
    imageUrl: string;
    imagePreview: string | null;
    isUploading: boolean;
    error: string | null;

    // Actions
    handleFileSelect: (file: File) => Promise<void>;
    handleDrop: (e: React.DragEvent) => void;
    handleDragOver: (e: React.DragEvent) => void;
    handleDragLeave: (e: React.DragEvent) => void;
    clearImage: () => void;
    setImageFromUrl: (url: string) => void;

    // Drag state
    isDragging: boolean;
}

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const DEFAULT_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

/**
 * Shared hook for image upload functionality.
 * Used by both AdminPanel and CreateTrader components.
 */
export const useImageUpload = (options: UseImageUploadOptions = {}): UseImageUploadReturn => {
    const {
        maxSizeBytes = DEFAULT_MAX_SIZE,
        allowedTypes = DEFAULT_ALLOWED_TYPES,
        uploadPath = 'traders'
    } = options;

    const [imageUrl, setImageUrl] = useState<string>('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Validate file before upload
    const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
        if (!allowedTypes.includes(file.type)) {
            return {
                valid: false,
                error: `Invalid file type. Allowed: ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}`
            };
        }

        if (file.size > maxSizeBytes) {
            const maxMB = (maxSizeBytes / (1024 * 1024)).toFixed(0);
            return {
                valid: false,
                error: `File too large. Maximum size: ${maxMB}MB`
            };
        }

        return { valid: true };
    }, [allowedTypes, maxSizeBytes]);

    // Handle file selection and upload
    const handleFileSelect = useCallback(async (file: File) => {
        // Clear previous errors
        setError(null);

        // Validate
        const validation = validateFile(file);
        if (!validation.valid) {
            setError(validation.error || 'Invalid file');
            return;
        }

        // Show optimistic preview immediately
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to Firebase Storage
        setIsUploading(true);

        try {
            const path = `${uploadPath}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            const url = await uploadImage(file, path);
            setImageUrl(url);
            console.log('Image uploaded successfully:', url);
        } catch (err: any) {
            console.error('Upload failed:', err);
            setError(err.message || 'Upload failed. Please try again.');
            setImagePreview(null);
            setImageUrl('');
        } finally {
            setIsUploading(false);
        }
    }, [uploadPath, validateFile]);

    // Drag and drop handlers
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    }, [handleFileSelect]);

    // Clear image
    const clearImage = useCallback(() => {
        setImageUrl('');
        setImagePreview(null);
        setError(null);
    }, []);

    // Set image from external URL (for editing existing traders)
    const setImageFromUrl = useCallback((url: string) => {
        setImageUrl(url);
        setImagePreview(url);
        setError(null);
    }, []);

    return {
        imageUrl,
        imagePreview,
        isUploading,
        error,
        handleFileSelect,
        handleDrop,
        handleDragOver,
        handleDragLeave,
        clearImage,
        setImageFromUrl,
        isDragging
    };
};

export default useImageUpload;
