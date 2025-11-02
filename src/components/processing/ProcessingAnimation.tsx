'use client';

import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Document } from '@/types/document';
import { cn } from '@/lib/utils';

interface ProcessingAnimationProps {
    documents: Document[];
    processedCount: number;
    failedDocuments?: string[];
    className?: string;
}

export function ProcessingAnimation({
    documents,
    processedCount,
    failedDocuments = [],
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const index = 0; // This variable is not used but kept for potential future use

    return (
        <Card className={cn('p-8 shadow-lg', className)}>
            <h3 className="font-semibold text-foreground mb-6 text-lg">Documents en cours de traitement</h3>

            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
                {visibleDocuments.map((doc, index) => {
                    const isProcessed = documents.indexOf(doc) < processedCount;
                    const isCurrent = documents.indexOf(doc) === processedCount - 1;
                    const hasFailed = failedDocuments.includes(doc.id);

                    return (
                        <Card
                            key={doc.id}
                            hover={!isCurrent}
                            className={cn(
                                'p-4 transition-all duration-300',
                                isProcessed && !hasFailed && 'bg-success-light shadow-md ring-2 ring-success',
                                hasFailed && 'bg-error-light shadow-md ring-2 ring-error',
                                isCurrent && !hasFailed && 'bg-primary-light shadow-lg ring-2 ring-primary scale-105',
                                !isProcessed && !isCurrent && 'bg-background-elevated shadow-sm'
                            )}
                        >
                            <div className="flex items-center gap-4">
                                {hasFailed ? (
                                    <div className="w-10 h-10 rounded-xl bg-error flex items-center justify-center shrink-0">
                                        <AlertCircle className="h-5 w-5 text-white" />
                                    </div>
                                ) : isProcessed ? (
                                    <div className="w-10 h-10 rounded-xl bg-success flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="h-5 w-5 text-white" />
                                    </div>
                                ) : isCurrent ? (
                                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
                                        <Loader2 className="h-5 w-5 text-white animate-spin" />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded-xl bg-background-secondary flex items-center justify-center shrink-0">
                                        <FileText className="h-5 w-5 text-foreground-muted" />
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                        {doc.originalName}
                                    </p>
                                    {hasFailed && (
                                        <p className="text-xs text-error mt-1.5 font-medium">
                                            ❌ Erreur lors du traitement
                                        </p>
                                    )}
                                    {isProcessed && !hasFailed && doc.mainCategory && (
                                        <p className="text-xs text-success mt-1.5 font-medium">
                                            ✓ Classifié: {doc.mainCategory}
                                            {doc.subCategory && ` › ${doc.subCategory}`}
                                        </p>
                                    )}
                                    {isCurrent && !hasFailed && (
                                        <p className="text-xs text-primary mt-1.5 font-medium animate-pulse">
                                            🔄 Analyse en cours...
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })}

                {processedCount === documents.length && (
                    <Card className="p-8 text-center bg-success-light shadow-lg animate-scale-in">
                        <div className="w-16 h-16 bg-success rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="h-8 w-8 text-white" />
                        </div>
                        <p className="font-semibold text-success text-lg">
                            🎉 Tous les documents ont été traités !
                        </p>
                        {failedDocuments.length > 0 && (
                            <p className="text-sm text-error mt-3 font-medium">
                                ⚠️ {failedDocuments.length} document(s) en erreur
                            </p>
                        )}
                    </Card>
                )}
            </div>
        </Card>
    );
}