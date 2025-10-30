'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText } from 'lucide-react';
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
                'relative border-2 border-dashed rounded-lg p-12 transition-all cursor-pointer',
                'hover:border-primary hover:bg-background-secondary',
                isDragActive && 'border-primary bg-primary-light',
                isDragReject && 'border-error bg-error-light',
                disabled && 'opacity-50 cursor-not-allowed',
                className
            )}
        >
            <input {...getInputProps()} />

            <div className="flex flex-col items-center justify-center gap-4 text-center">
                {isDragActive ? (
                    <>
                        <Upload className="h-16 w-16 text-primary animate-bounce" />
                        <div>
                            <p className="text-lg font-semibold text-primary">
                                Déposez vos fichiers ici
                            </p>
                            <p className="text-sm text-foreground-muted mt-1">
                                Relâchez pour ajouter les fichiers
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="relative">
                            <FileText className="h-16 w-16 text-foreground-muted" />
                            <Upload className="h-8 w-8 text-primary absolute -bottom-1 -right-1" />
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-foreground">
                                Glissez-déposez vos documents ici
                            </p>
                            <p className="text-sm text-foreground-muted mt-1">
                                ou cliquez pour sélectionner des fichiers
                            </p>
                        </div>
                        <div className="mt-4 space-y-1 text-xs text-foreground-muted">
                            <p>PDF, DOCX, TXT, XLSX, CSV, MD, RTF, ODT, ODS</p>
                            <p>Maximum 50 MB par fichier • 100 fichiers max • 200 MB total</p>
                        </div>
                    </>
                )}
            </div>

            {isDragReject && (
                <div className="absolute inset-0 flex items-center justify-center bg-error-light rounded-lg">
                    <p className="text-error font-semibold">
                        Certains fichiers ne sont pas supportés
                    </p>
                </div>
            )}
        </div>
    );
}