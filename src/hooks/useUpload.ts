'use client';

import { useState, useCallback } from 'react';
import { siteConfig } from '@/config/site';
import { fileSchema } from '@/lib/validators/uploadSchemas';
import { UploadedFile } from '@/types/document';
import { ApiResponse } from '@/types/api';

export function useUpload() {
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
        setFiles((prev) => [...prev, ...validNewFiles.map((f) => ({
            originalName: f.name,
            filename: `${Date.now()}-${f.name}`,
            fileSize: f.size,
            mimeType: f.type,
            status: 'pending' as const,
            progress: 0,
        }))]);
    }, [validateFile]);

    const removeFile = useCallback((index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
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
        files.forEach((fileInfo, index) => {
            // Note: This is a placeholder implementation
            // In a real implementation, you would need to store the actual File objects
            // and retrieve them here to create the FormData properly
            const file = new File([], fileInfo.filename);
            formData.append('files', file, fileInfo.originalName);
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

    return {
        files,
        uploading,
        progress,
        addFiles,
        removeFile,
        clearFiles,
        uploadFiles,
        validateFile,
        isValid,
    };
}