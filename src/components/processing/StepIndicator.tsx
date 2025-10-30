'use client';

import React from 'react';
import { Check, Loader2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SessionStatus } from '@/types/session';

interface Step {
    id: string;
    label: string;
    status: 'completed' | 'processing' | 'pending' | 'error';
}

interface StepIndicatorProps {
    currentStatus: SessionStatus;
    className?: string;
}

export function StepIndicator({ currentStatus, className }: StepIndicatorProps) {
    const steps: Step[] = [
        {
            id: 'upload',
            label: 'Upload terminé',
            status: currentStatus === 'uploading' ? 'processing' : 'completed',
        },
        {
            id: 'extract',
            label: 'Extraction du contenu',
            status:
                currentStatus === 'uploading'
                    ? 'pending'
                    : currentStatus === 'extracting'
                        ? 'processing'
                        : currentStatus === 'classifying' || currentStatus === 'ready'
                            ? 'completed'
                            : 'pending',
        },
        {
            id: 'classify',
            label: 'Classification intelligente',
            status:
                currentStatus === 'classifying'
                    ? 'processing'
                    : currentStatus === 'ready'
                        ? 'completed'
                        : 'pending',
        },
    ];

    return (
        <div className={cn('w-full', className)}>
            <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                    <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center gap-2 flex-1">
                            {/* Icône de l'étape */}
                            <div
                                className={cn(
                                    'flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all',
                                    step.status === 'completed' &&
                                    'bg-success border-success text-white',
                                    step.status === 'processing' &&
                                    'bg-primary border-primary text-white animate-pulse',
                                    step.status === 'pending' &&
                                    'bg-background border-border text-foreground-muted',
                                    step.status === 'error' &&
                                    'bg-error border-error text-white'
                                )}
                            >
                                {step.status === 'completed' && <Check className="h-6 w-6" />}
                                {step.status === 'processing' && (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                )}
                                {step.status === 'pending' && <Circle className="h-6 w-6" />}
                            </div>

                            {/* Label */}
                            <p
                                className={cn(
                                    'text-sm font-medium text-center',
                                    step.status === 'completed' && 'text-success',
                                    step.status === 'processing' && 'text-primary',
                                    step.status === 'pending' && 'text-foreground-muted',
                                    step.status === 'error' && 'text-error'
                                )}
                            >
                                {step.label}
                            </p>
                        </div>

                        {/* Ligne de connexion */}
                        {index < steps.length - 1 && (
                            <div className="flex-1 h-0.5 mx-2 mb-8">
                                <div
                                    className={cn(
                                        'h-full transition-all',
                                        steps[index + 1].status === 'completed' ||
                                            steps[index + 1].status === 'processing'
                                            ? 'bg-primary'
                                            : 'bg-border'
                                    )}
                                />
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}