'use client';

import React from 'react';
import { X, FileText, FileSpreadsheet, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DocumentUpload } from '@/types/document';
import { formatFileSize } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface FileListProps {
    files: DocumentUpload[];
    onRemove: (fileId: string) => void;
    disabled?: boolean;
}

export function FileList({ files, onRemove, disabled = false }: FileListProps) {
    if (files.length === 0) return null;

    const getFileIcon = (type: string) => {
        if (type === 'pdf' || type === 'docx' || type === 'doc' || type === 'txt' || type === 'md' || type === 'rtf' || type === 'odt') {
            return <FileText className="h-5 w-5 text-primary" />;
        }
        if (type === 'xlsx' || type === 'xls' || type === 'csv' || type === 'ods') {
            return <FileSpreadsheet className="h-5 w-5 text-success" />;
        }
        return <File className="h-5 w-5 text-foreground-muted" />;
    };

    return (
        <Card className="p-6 shadow-md">
            <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-foreground text-lg">
                    Fichiers sélectionnés ({files.length})
                </h3>
                <p className="text-sm text-foreground-muted font-medium">
                    Total: {formatFileSize(files.reduce((sum, f) => sum + f.size, 0))}
                </p>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {files.map((file) => (
                    <Card
                        key={file.id}
                        hover
                        className={cn(
                            'p-4 transition-all duration-200',
                            'shadow-sm hover:shadow-md',
                            file.status === 'error' && 'bg-error-light shadow-md ring-2 ring-error'
                        )}
                    >
                        <div className="flex items-center gap-4">
                            <div className="shrink-0">
                                {getFileIcon(file.type)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                    {file.name}
                                </p>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className="text-xs text-foreground-muted font-medium">
                                        {formatFileSize(file.size)}
                                    </span>
                                    <span className="text-xs text-foreground-muted">•</span>
                                    <span className="text-xs text-foreground-muted uppercase font-medium">
                                        {file.type}
                                    </span>
                                </div>
                            </div>

                            {file.status === 'uploading' && (
                                <div className="text-xs text-primary font-medium px-3 py-1.5 bg-primary-light rounded-lg">
                                    Envoi...
                                </div>
                            )}

                            {file.status === 'error' && (
                                <div className="text-xs text-error font-medium px-3 py-1.5 bg-error-light rounded-lg">
                                    Erreur
                                </div>
                            )}

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onRemove(file.id)}
                                disabled={disabled}
                                className="shrink-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </Card>
    );
}