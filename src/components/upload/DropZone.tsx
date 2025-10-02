'use client';

import { useCallback, useRef } from 'react';
import { useUpload } from '@/hooks/useUpload';
import { UploadCloud, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface DropZoneProps { }

export default function DropZone({ }: DropZoneProps) {
    const { addFiles, validateFile } = useUpload();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            const droppedFiles = Array.from(e.dataTransfer.files);
            const validFiles = droppedFiles.filter(validateFile);
            if (validFiles.length > 0) {
                addFiles(validFiles);
            }
        },
        [addFiles, validateFile]
    );

    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFiles = Array.from(e.target.files || []);
            const validFiles = selectedFiles.filter(validateFile);
            if (validFiles.length > 0) {
                addFiles(validFiles);
            }
            e.target.value = ''; // Reset input
        },
        [addFiles, validateFile]
    );

    return (
        <div
            className={cn(
                'glass-card border-2 border-dashed border-border rounded-lg p-8 text-center transition-all duration-200 hover:border-primary',
                'min-h-[300px] flex flex-col items-center justify-center'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
        >
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.doc,.txt,.xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
            />
            <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Drop your files here</h3>
            <p className="text-muted-foreground mb-4">or click to select</p>
            <p className="text-xs text-muted-foreground">
                Supported: PDF, DOCX, DOC, TXT, XLSX, XLS, CSV (Max 10MB each)
            </p>
        </div>
    );
}