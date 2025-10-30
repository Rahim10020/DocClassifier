import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DocumentUpload } from '@/types/document';
import { Profile } from '@/types/category';
import { validateFiles } from '@/lib/validators/file-validator';

interface UseUploadOptions {
    profile?: Profile;
    language?: string;
    onSuccess?: (sessionId: string) => void;
    onError?: (error: string) => void;
}

export function useUpload(options: UseUploadOptions = {}) {
    const router = useRouter();
    const [files, setFiles] = useState<DocumentUpload[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const addFiles = useCallback((newFiles: File[]) => {
        const validation = validateFiles(newFiles);

        if (!validation.valid) {
            setError(validation.errors.map(e => e.error).join(', '));
            return;
        }

        const documentUploads: DocumentUpload[] = newFiles.map(file => ({
            file,
            id: `${Date.now()}_${Math.random().toString(36).substring(7)}`,
            name: file.name,
            size: file.size,
            type: file.name.split('.').pop()?.toLowerCase() || 'unknown',
            status: 'pending',
            progress: 0,
        }));

        setFiles(prev => [...prev, ...documentUploads]);
        setError(null);
    }, []);

    const removeFile = useCallback((fileId: string) => {
        setFiles(prev => prev.filter(f => f.id !== fileId));
    }, []);

    const clearFiles = useCallback(() => {
        setFiles([]);
        setError(null);
        setUploadProgress(0);
    }, []);

    const uploadFiles = useCallback(async () => {
        if (files.length === 0) {
            setError('Aucun fichier à uploader');
            return;
        }

        setIsUploading(true);
        setError(null);
        setUploadProgress(0);

        try {
            const formData = new FormData();

            // Ajouter les fichiers
            files.forEach(fileDoc => {
                formData.append('files', fileDoc.file);
            });

            // Ajouter les métadonnées
            if (options.profile) {
                formData.append('profile', options.profile);
            }
            if (options.language) {
                formData.append('language', options.language);
            }

            // Faire l'upload
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Erreur lors de l\'upload');
            }

            setUploadProgress(100);

            // Callback de succès
            if (options.onSuccess) {
                options.onSuccess(data.data.sessionId);
            }

            // Rediriger vers la page de processing
            router.push(`/processing/${data.data.sessionId}`);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
            setError(errorMessage);

            if (options.onError) {
                options.onError(errorMessage);
            }
        } finally {
            setIsUploading(false);
        }
    }, [files, options, router]);

    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    const fileCount = files.length;

    return {
        files,
        addFiles,
        removeFile,
        clearFiles,
        uploadFiles,
        isUploading,
        uploadProgress,
        error,
        totalSize,
        fileCount,
        canUpload: fileCount > 0 && !isUploading,
    };
}