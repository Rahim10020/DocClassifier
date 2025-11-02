'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
    current: number;
    total: number;
    message?: string;
    className?: string;
}

export function ProgressBar({ current, total, message, className }: ProgressBarProps) {
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

    return (
        <Card className={cn('p-8 shadow-lg', className)}>
            <div className="space-y-6">
                {/* En-tête */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-foreground text-lg">
                            Traitement en cours
                        </h3>
                        {message && (
                            <p className="text-sm text-foreground-muted mt-1">{message}</p>
                        )}
                    </div>
                    <div className="text-right">
                        <p className="text-4xl font-bold text-primary">{percentage}%</p>
                        <p className="text-sm text-foreground-muted font-medium mt-1">
                            {current} / {total}
                        </p>
                    </div>
                </div>

                {/* Barre de progression */}
                <div className="space-y-2">
                    <div className="h-3 w-full bg-background-secondary rounded-full overflow-hidden shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-primary-hover transition-all duration-500 ease-out rounded-full shadow-sm"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                </div>

                {/* Détails */}
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span className="text-foreground-muted font-medium">{current} traités</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-foreground-muted" />
                        <span className="text-foreground-muted font-medium">{total - current} restants</span>
                    </div>
                </div>
            </div>
        </Card>
    );
}