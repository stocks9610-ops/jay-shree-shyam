import React from 'react';

interface ImageUploadZoneProps {
    imagePreview: string | null;
    isUploading: boolean;
    isDragging: boolean;
    error: string | null;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onFileSelect: (file: File) => void;
    onClear: () => void;
    inputId?: string;
    className?: string;
}

/**
 * Reusable image upload dropzone component.
 * Used in both AdminPanel and CreateTrader.
 */
const ImageUploadZone: React.FC<ImageUploadZoneProps> = ({
    imagePreview,
    isUploading,
    isDragging,
    error,
    onDragOver,
    onDragLeave,
    onDrop,
    onFileSelect,
    onClear,
    inputId = 'image-upload-input',
    className = ''
}) => {
    const handleClick = () => {
        document.getElementById(inputId)?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileSelect(file);
        }
        // Reset input so same file can be selected again
        e.target.value = '';
    };

    return (
        <div className={`relative ${className}`}>
            <input
                type="file"
                id={inputId}
                className="hidden"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
            />

            <div
                className={`border-4 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer
                    ${isDragging
                        ? 'border-[#f01a64] bg-[#f01a64]/10'
                        : 'border-white/10 hover:border-white/20'
                    }
                    ${error ? 'border-red-500/50' : ''}
                `}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={!imagePreview ? handleClick : undefined}
            >
                {imagePreview ? (
                    <div className="relative">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-white shadow-xl"
                        />
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onClear();
                            }}
                            className="absolute top-0 right-1/2 translate-x-16 -translate-y-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
                            title="Remove image"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <p className="text-[#00b36b] font-bold text-xs mt-4 uppercase tracking-widest">Image Ready</p>
                    </div>
                ) : isUploading ? (
                    <div className="space-y-4">
                        <div className="w-12 h-12 border-4 border-[#f01a64] border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-[#f01a64] font-bold uppercase text-xs animate-pulse">Uploading to Cloud...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="w-20 h-20 bg-white/5 rounded-full mx-auto flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-gray-400 font-bold uppercase text-xs">Drop Profile Pic Here</p>
                            <p className="text-gray-600 text-[10px] mt-1">or click to browse</p>
                        </div>
                        <p className="text-gray-600 text-[9px] uppercase">JPG, PNG, GIF, WebP • Max 5MB</p>
                    </div>
                )}
            </div>

            {error && (
                <div className="mt-3 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-xl text-xs font-bold">
                    {error}
                </div>
            )}
        </div>
    );
};

export default ImageUploadZone;
