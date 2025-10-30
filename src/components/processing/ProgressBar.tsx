'use client';

import React from 'react';
import { Progress } from '@/components/ui/progress';
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
        <Card className={cn('p-6', className)}>
            <div className="space-y-4">
                {/* En-tête */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-foreground">
                            Traitement en cours...
                        </h3>
                        {message && (
                            <p className="text-sm text-foreground-muted mt-1">{message}</p>
                        )}
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{percentage}%</p>
                        <p className="text-sm text-foreground-muted">
                            {current} / {total}
                        </p>
                    </div>
                </div>

                {/* Barre de progression */}
                <Progress value={percentage} max={100} className="h-3" />

                {/* Détails */}
                <div className="flex items-center justify-between text-sm text-foreground-muted">
                    <span>{current} documents traités</span>
                    <span>{total - current} restants</span>
                </div>
            </div>
        </Card>
    );
}