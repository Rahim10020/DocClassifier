'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

/**
 * Confirmation dialog component for destructive actions
 */

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
    isLoading?: boolean;
    children?: React.ReactNode;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'default',
    isLoading = false,
    children,
}: ConfirmDialogProps) {
    const handleKeyDown = React.useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    React.useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        } else {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {title}
                        </h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-600">
                                {message}
                            </p>
                        </div>
                        {children && (
                            <div className="mt-3">
                                {children}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 justify-end">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            {cancelText}
                        </Button>
                        <Button
                            variant={variant}
                            onClick={onConfirm}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Loading...' : confirmText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Hook for managing confirmation dialogs
 */
export function useConfirmDialog() {
    const [dialogState, setDialogState] = React.useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmText?: string;
        cancelText?: string;
        variant?: 'default' | 'destructive';
        onConfirm?: () => void;
        children?: React.ReactNode;
    }>({
        isOpen: false,
        title: '',
        message: '',
    });

    const showConfirmDialog = React.useCallback((
        title: string,
        message: string,
        options?: {
            confirmText?: string;
            cancelText?: string;
            variant?: 'default' | 'destructive';
            children?: React.ReactNode;
        }
    ) => {
        return new Promise<boolean>((resolve) => {
            setDialogState({
                isOpen: true,
                title,
                message,
                confirmText: options?.confirmText,
                cancelText: options?.cancelText,
                variant: options?.variant,
                children: options?.children,
                onConfirm: () => {
                    resolve(true);
                    setDialogState(prev => ({ ...prev, isOpen: false }));
                },
            });
        });
    }, []);

    const closeDialog = React.useCallback(() => {
        setDialogState(prev => ({
            ...prev,
            isOpen: false,
            onConfirm: undefined,
        }));
    }, []);

    const ConfirmDialogComponent = React.useMemo(() => {
        if (!dialogState.isOpen) return null;

        return (
            <ConfirmDialog
                isOpen={dialogState.isOpen}
                onClose={closeDialog}
                onConfirm={dialogState.onConfirm || closeDialog}
                title={dialogState.title}
                message={dialogState.message}
                confirmText={dialogState.confirmText}
                cancelText={dialogState.cancelText}
                variant={dialogState.variant}
                children={dialogState.children}
            />
        );
    }, [dialogState, closeDialog]);

    return {
        showConfirmDialog,
        closeDialog,
        ConfirmDialogComponent,
    };
}

/**
 * Pre-configured confirmation dialogs for common actions
 */
export const confirmDialogs = {
    delete: {
        title: 'Delete Item',
        message: 'Are you sure you want to delete this item? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        variant: 'destructive' as const,
    },
    archive: {
        title: 'Archive Item',
        message: 'Are you sure you want to archive this item?',
        confirmText: 'Archive',
        cancelText: 'Cancel',
        variant: 'default' as const,
    },
    publish: {
        title: 'Publish Changes',
        message: 'Are you sure you want to publish these changes?',
        confirmText: 'Publish',
        cancelText: 'Cancel',
        variant: 'default' as const,
    },
    logout: {
        title: 'Sign Out',
        message: 'Are you sure you want to sign out?',
        confirmText: 'Sign Out',
        cancelText: 'Cancel',
        variant: 'default' as const,
    },
} as const;