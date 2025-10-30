'use client';

import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ExportOptions } from './ExportOptions';
import { StructurePreview } from './StructurePreview';
import { ExportOptions as ExportOptionsType } from '@/types/session';
import { cn } from '@/lib/utils';

interface DownloadButtonProps {
    sessionId: string;
    documentCount: number;
    disabled?: boolean;
    className?: string;
}

export function DownloadButton({
    sessionId,
    documentCount,
    disabled = false,
    className,
}: DownloadButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [options, setOptions] = useState<ExportOptionsType>({
        includeReadme: true,
        structure: 'hierarchical',
        format: 'zip',
    });
    const [showPreview, setShowPreview] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);

        try {
            const response = await fetch('/api/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId,
                    options,
                }),
            });

            if (!response.ok) {
                throw new Error('Erreur lors du téléchargement');
            }

            // Télécharger le fichier
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `classifier_${sessionId}.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setIsOpen(false);
        } catch (error) {
            console.error('Download error:', error);
            alert('Erreur lors du téléchargement. Veuillez réessayer.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                disabled={disabled || documentCount === 0}
                className={cn('gap-2', className)}
                size="lg"
            >
                <Download className="h-5 w-5" />
                Télécharger ZIP ({documentCount})
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl" onClose={() => setIsOpen(false)}>
                    <DialogHeader>
                        <DialogTitle>Télécharger vos documents</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 mt-4">
                        {/* Export Options */}
                        <ExportOptions
                            options={options}
                            onChange={setOptions}
                            onShowPreview={() => setShowPreview(!showPreview)}
                        />

                        {/* Structure Preview */}
                        {showPreview && (
                            <StructurePreview
                                sessionId={sessionId}
                                structure={options.structure}
                            />
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                disabled={isDownloading}
                            >
                                Annuler
                            </Button>
                            <Button
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className="gap-2"
                            >
                                {isDownloading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Téléchargement...
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-4 w-4" />
                                        Confirmer et télécharger
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}