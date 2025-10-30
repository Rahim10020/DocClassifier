'use client';

import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Document } from '@/types/document';
import { cn } from '@/lib/utils';

interface ProcessingAnimationProps {
    documents: Document[];
    processedCount: number;
    className?: string;
}

export function ProcessingAnimation({
    documents,
    processedCount,
    className,
}: ProcessingAnimationProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (processedCount > currentIndex && processedCount <= documents.length) {
            setCurrentIndex(processedCount);
        }
    }, [processedCount, currentIndex, documents.length]);

    const visibleDocuments = documents.slice(
        Math.max(0, currentIndex - 5),
        currentIndex + 1
    );

    return (
        <Card className={cn('p-6', className)}>
            <h3 className="font-semibold text-foreground mb-4">Documents en cours</h3>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {visibleDocuments.map((doc, index) => {
                    const isProcessed = documents.indexOf(doc) < processedCount;
                    const isCurrent = documents.indexOf(doc) === processedCount - 1;

                    return (
                        <div
                            key={doc.id}
                            className={cn(
                                'flex items-center gap-3 p-3 rounded-lg border transition-all',
                                isProcessed && 'border-success bg-success-light',
                                isCurrent && 'border-primary bg-primary-light animate-pulse',
                                !isProcessed && !isCurrent && 'border-border bg-background'
                            )}
                        >
                            {isProcessed ? (
                                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                            ) : (
                                <FileText className="h-5 w-5 text-foreground-muted shrink-0" />
                            )}

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                    {doc.originalName}
                                </p>
                                {isProcessed && doc.mainCategory && (
                                    <p className="text-xs text-success mt-1">
                                        ✓ Classifié dans: {doc.mainCategory}
                                        {doc.subCategory && ` > ${doc.subCategory}`}
                                    </p>
                                )}
                                {isCurrent && (
                                    <p className="text-xs text-primary mt-1">
                                        Analyse en cours...
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}

                {processedCount === documents.length && (
                    <div className="text-center py-4">
                        <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-2" />
                        <p className="font-semibold text-success">
                            🎉 Tous les documents ont été traités !
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
}