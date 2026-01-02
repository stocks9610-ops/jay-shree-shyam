import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    message?: string;
    fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    message,
    fullScreen = false
}) => {
    const sizeClasses = {
        sm: 'h-8 w-8',
        md: 'h-12 w-12',
        lg: 'h-16 w-16'
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative">
                <div className={`${sizeClasses[size]} animate-spin rounded-full border-t-2 border-b-2 border-[#f01a64]`}></div>
                <div className={`${sizeClasses[size]} absolute top-0 animate-spin rounded-full border-t-2 border-b-2 border-[#00b36b] opacity-50`} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            {message && (
                <p className="text-white font-bold text-sm animate-pulse">{message}</p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="min-h-screen bg-[#131722] flex items-center justify-center">
                {spinner}
            </div>
        );
    }

    return spinner;
};

export default LoadingSpinner;
