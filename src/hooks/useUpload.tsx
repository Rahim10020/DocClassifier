'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { siteConfig } from '@/config/site';
import { fileSchema } from '@/lib/validators/uploadSchemas';
import { UploadedFile } from '@/types/document';
import { ApiResponse } from '@/types/api';

type UploadContextValue = {
    files: UploadedFile[];
    uploading: boolean;
    progress: number;
    addFiles: (files: File[]) => void;
    removeFile: (index: number) => void;
    clearFiles: () => void;
    uploadFiles: () => Promise<ApiResponse<{ classificationId: string; sessionId: string; totalFiles: number }>>;
    validateFile: (file: File) => boolean;
    isValid: boolean;
};

const UploadContext = createContext<UploadContextValue | null>(null);

export function UploadProvider({ children }: { children: React.ReactNode }) {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const validateFile = useCallback((file: File): boolean => {
        const result = fileSchema.safeParse({
            name: file.name,
            size: file.size,
            type: file.type,
        });
        return result.success;
    }, []);

    const addFiles = useCallback((newFiles: File[]) => {
        const validNewFiles = newFiles.filter(validateFile);
        if (validNewFiles.length === 0) return;
        setFiles((previousFiles) => [
            ...previousFiles,
            ...validNewFiles.map((file) => ({
                file,
                originalName: file.name,
                filename: `${Date.now()}-${file.name}`,
                fileSize: file.size,
                mimeType: file.type,
                status: 'pending' as const,
                progress: 0,
            })),
        ]);
    }, [validateFile]);

    const removeFile = useCallback((index: number) => {
        setFiles((previousFiles) => previousFiles.filter((_, i) => i !== index));
    }, []);

    const clearFiles = useCallback(() => {
        setFiles([]);
        setProgress(0);
    }, []);

    const uploadFiles = useCallback(async (): Promise<ApiResponse<{ classificationId: string; sessionId: string; totalFiles: number }>> => {
        if (files.length === 0 || uploading) return { success: false, error: 'No files to upload' };

        setUploading(true);
        setProgress(0);

        const formData = new FormData();
        files.forEach((fileInfo) => {
            formData.append('files', fileInfo.file, fileInfo.originalName);
        });

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json() as ApiResponse<{ classificationId: string; sessionId: string; totalFiles: number }>;

            if (data.success) {
                setProgress(100);
                clearFiles();
            }

            return data;
        } catch (error) {
            setUploading(false);
            return { success: false, error: 'Upload failed' };
        } finally {
            setUploading(false);
        }
    }, [files, uploading, clearFiles]);

    const isValid = files.length > 0 && files.length <= siteConfig.maxFiles &&
        files.reduce((sum, f) => sum + f.fileSize, 0) <= siteConfig.maxFileSize * siteConfig.maxFiles;

    const value = useMemo<UploadContextValue>(() => ({
        files,
        uploading,
        progress,
        addFiles,
        removeFile,
        clearFiles,
        uploadFiles,
        validateFile,
        isValid,
    }), [files, uploading, progress, addFiles, removeFile, clearFiles, uploadFiles, validateFile, isValid]);

    return (
        <UploadContext.Provider value={value}>{children}</UploadContext.Provider>
    );
}

export function useUpload(): UploadContextValue {
    const ctx = useContext(UploadContext);
    if (!ctx) {
        throw new Error('useUpload must be used within an UploadProvider');
    }
    return ctx;
}


