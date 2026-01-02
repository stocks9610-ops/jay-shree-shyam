/**
 * Validation utilities for admin panel
 */

export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validateTRC20Address = (address: string): boolean => {
    // TRC20 addresses start with 'T' and are 34 characters long
    return /^T[a-zA-Z0-9]{33}$/.test(address);
};

export const validateERC20Address = (address: string): boolean => {
    // ERC20 addresses start with '0x' and are 42 characters long
    return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const validateBEP20Address = (address: string): boolean => {
    // BEP20 uses same format as ERC20
    return validateERC20Address(address);
};

export const validateURL = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

export const validateYouTubeURL = (url: string): boolean => {
    if (!validateURL(url)) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
};

export const validateSocialURL = (url: string, platform: 'instagram' | 'telegram' | 'twitter'): boolean => {
    if (!validateURL(url)) return false;
    const platformUrls: Record<string, string[]> = {
        instagram: ['instagram.com'],
        telegram: ['t.me', 'telegram.me'],
        twitter: ['twitter.com', 'x.com']
    };
    return platformUrls[platform].some(domain => url.includes(domain));
};

export const validateNumberRange = (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
};

export const validateROI = (roi: number): boolean => {
    return validateNumberRange(roi, -100, 10000); // ROI can be -100% to 10000%
};

export const validateWinRate = (winRate: number): boolean => {
    return validateNumberRange(winRate, 0, 100);
};

export const validateRiskScore = (score: number): boolean => {
    return Number.isInteger(score) && validateNumberRange(score, 1, 10);
};

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: 'Only JPG, PNG, GIF, and WebP images are allowed' };
    }

    if (file.size > maxSize) {
        return { valid: false, error: 'Image size must be less than 5MB' };
    }

    return { valid: true };
};

export const sanitizeTraderInput = (input: string): string => {
    // Remove potentially dangerous characters
    return input.trim().replace(/[<>]/g, '');
};
