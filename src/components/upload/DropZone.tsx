'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from '@/types/document';

interface DropZoneProps {
    onFilesAdded: (files: File[]) => void;
    disabled?: boolean;
    className?: string;
}

export function DropZone({ onFilesAdded, disabled = false, className }: DropZoneProps) {
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles.length > 0) {
                onFilesAdded(acceptedFiles);
            }
        },
        [onFilesAdded]
    );

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        disabled,
        accept: Object.values(ACCEPTED_FILE_TYPES).reduce((acc, types) => {
            types.forEach(type => {
                acc[type] = [];
            });
            return acc;
        }, {} as Record<string, string[]>),
        maxSize: MAX_FILE_SIZE,
        multiple: true,
    });

    return (
        <div
            {...getRootProps()}
            className={cn(
                'relative rounded-2xl p-16 transition-all cursor-pointer group',
                'bg-background-elevated shadow-sm hover:shadow-lg',
                'border-2 border-dashed',
                isDragActive && !isDragReject && 'border-primary bg-primary-light shadow-xl scale-[1.02]',
                isDragReject && 'border-error bg-error-light',
                !isDragActive && !isDragReject && 'border-border hover:border-primary/50',
                disabled && 'opacity-50 cursor-not-allowed',
                className
            )}
        >
            <input {...getInputProps()} />

            <div className="flex flex-col items-center justify-center gap-6 text-center">
                {isDragActive ? (
                    <>
                        <div className="relative">
                            <Upload className="h-20 w-20 text-primary animate-bounce" />
                            <Sparkles className="h-6 w-6 text-primary absolute -top-2 -right-2 animate-pulse" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-primary mb-2">
                                Déposez vos fichiers ici
                            </p>
                            <p className="text-sm text-foreground-muted">
                                Relâchez pour ajouter les fichiers
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="relative">
                            <div className="w-20 h-20 rounded-2xl bg-primary-light flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FileText className="h-10 w-10 text-primary" />
                            </div>
                            <Upload className="h-8 w-8 text-primary absolute -bottom-2 -right-2 bg-background-elevated rounded-full p-1.5 shadow-md" />
                        </div>
                        <div>
                            <p className="text-xl font-semibold text-foreground mb-2">
                                Glissez-déposez vos documents ici
                            </p>
                            <p className="text-sm text-foreground-muted">
                                ou cliquez pour sélectionner des fichiers
                            </p>
                        </div>
                        <div className="space-y-1 text-xs text-foreground-muted bg-background-secondary px-6 py-3 rounded-xl">
                            <p className="font-medium">PDF, DOCX, TXT, XLSX, CSV, MD, RTF, ODT, ODS</p>
                            <p>Maximum 50 MB par fichier • 50 fichiers max • 200 MB total</p>
                        </div>
                    </>
                )}
            </div>

            {isDragReject && (
                <div className="absolute inset-0 flex items-center justify-center bg-error-light rounded-2xl">
                    <p className="text-error font-semibold text-lg">
                        ⚠️ Certains fichiers ne sont pas supportés
                    </p>
                </div>
            )}
        </div>
    );
}