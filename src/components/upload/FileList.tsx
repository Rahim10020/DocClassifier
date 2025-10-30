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
        <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">
                    Fichiers sélectionnés ({files.length})
                </h3>
                <p className="text-sm text-foreground-muted">
                    Total: {formatFileSize(files.reduce((sum, f) => sum + f.size, 0))}
                </p>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {files.map((file) => (
                    <div
                        key={file.id}
                        className={cn(
                            'flex items-center gap-3 p-3 rounded-lg border border-border bg-background hover:bg-background-secondary transition-colors',
                            file.status === 'error' && 'border-error bg-error-light'
                        )}
                    >
                        {getFileIcon(file.type)}

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                                {file.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-foreground-muted">
                                    {formatFileSize(file.size)}
                                </span>
                                <span className="text-xs text-foreground-muted">•</span>
                                <span className="text-xs text-foreground-muted uppercase">
                                    {file.type}
                                </span>
                            </div>
                        </div>

                        {file.status === 'uploading' && (
                            <div className="text-xs text-primary">
                                Envoi...
                            </div>
                        )}

                        {file.status === 'error' && (
                            <div className="text-xs text-error">
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
                ))}
            </div>
        </Card>
    );
}