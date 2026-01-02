/**
 * Translates raw system/Firebase errors into user-friendly, professional messages.
 * This ensures the user never sees "auth/invalid-credential" or other technical codes.
 */
export const getFriendlyErrorMessage = (error: any): string => {
    // 1. Handle Firebase Auth Errors by Code
    if (error?.code) {
        switch (error.code) {
            case 'auth/invalid-credential':
            case 'auth/wrong-password':
            case 'auth/user-not-found':
                return 'Incorrect email or password. Please try again.';
            case 'auth/email-already-in-use':
                return 'An account with this email already exists. Please login instead.';
            case 'auth/weak-password':
                return 'Password is too weak. It must be at least 6 characters.';
            case 'auth/too-many-requests':
                return 'Too many attempts. Access temporarily locked for security. Please try again later.';
            case 'auth/network-request-failed':
                return 'Network connection lost. Please check your internet connection.';
            case 'storage/retry-limit-exceeded':
                return 'Upload failed due to connection issues. Please try again.';
            case 'storage/canceled':
                return 'Upload was canceled.';
            case 'permission-denied':
                return 'Access denied. You do not have permission to perform this action.';
            default:
                // Log the unknown code for developer reference but show generic message to user
                console.warn('Unhandled Firebase Error Code:', error.code);
                return 'An unexpected system error occurred. Please try again.';
        }
    }

    // 2. Handle Standard Error Objects
    if (error?.message) {
        // Clean up common prefixes
        let message = error.message;
        message = message.replace('Firebase: ', '');
        message = message.replace(/\(auth\/.*\)\.?/, '');

        // If the message is still the raw code (sometimes happens), fallback to generic
        if (message.includes('auth/') || message.includes('storage/')) {
            return 'A system error occurred. Please try again.';
        }

        return message;
    }

    // 3. Fallback
    return 'An unexpected error occurred. Please try again.';
};
