'use client';

import React from 'react';
import { FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DocumentPreview } from '@/types/document';
import { formatFileSize } from '@/lib/utils';

interface FilePreviewProps {
    file: DocumentPreview | null;
    open: boolean;
    onClose: () => void;
}

export function FilePreview({ file, open, onClose }: FilePreviewProps) {
    if (!file) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[80vh]" onClose={onClose}>
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <FileText className="h-6 w-6 text-primary" />
                        <div className="flex-1 min-w-0">
                            <DialogTitle className="truncate">{file.name}</DialogTitle>
                            <div className="flex items-center gap-2 mt-1 text-sm text-foreground-muted">
                                <span>{formatFileSize(file.size)}</span>
                                <span>•</span>
                                <span className="uppercase">{file.type}</span>
                                {file.pageCount && (
                                    <>
                                        <span>•</span>
                                        <span>{file.pageCount} pages</span>
                                    </>
                                )}
                                {file.wordCount && (
                                    <>
                                        <span>•</span>
                                        <span>{file.wordCount} mots</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="mt-4 max-h-[50vh] overflow-y-auto">
                    <div className="p-4 rounded-lg bg-background-secondary border border-border">
                        <pre className="text-sm whitespace-pre-wrap font-mono text-foreground">
                            {file.content || 'Aucun contenu disponible'}
                        </pre>
                    </div>
                </div>

                <div className="mt-4 flex justify-end">
                    <Button onClick={onClose} variant="outline">
                        Fermer
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}