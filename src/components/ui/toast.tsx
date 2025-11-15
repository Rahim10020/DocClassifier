'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextValue {
    showToast: (toast: Omit<Toast, 'id'>) => void;
    hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

interface ToastProviderProps {
    children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast: Toast = {
            id,
            duration: toast.duration || 5000,
            ...toast,
        };

        setToasts((prev) => [...prev, newToast]);

        // Auto-dismiss after duration
        setTimeout(() => {
            hideToast(id);
        }, newToast.duration);
    }, []);

    const hideToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, hideToast }}>
            {children}
            <ToastContainer toasts={toasts} onClose={hideToast} />
        </ToastContext.Provider>
    );
}

interface ToastContainerProps {
    toasts: Toast[];
    onClose: (id: string) => void;
}

function ToastContainer({ toasts, onClose }: ToastContainerProps) {
    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-md">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onClose={onClose} />
                ))}
            </AnimatePresence>
        </div>
    );
}

interface ToastItemProps {
    toast: Toast;
    onClose: (id: string) => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
    const getToastStyles = () => {
        switch (toast.type) {
            case 'success':
                return {
                    bg: 'bg-success-light',
                    border: 'border-success',
                    icon: CheckCircle2,
                    iconColor: 'text-success',
                };
            case 'error':
                return {
                    bg: 'bg-error-light',
                    border: 'border-error',
                    icon: AlertCircle,
                    iconColor: 'text-error',
                };
            case 'warning':
                return {
                    bg: 'bg-warning-light',
                    border: 'border-warning',
                    icon: AlertTriangle,
                    iconColor: 'text-warning',
                };
            case 'info':
            default:
                return {
                    bg: 'bg-primary-light',
                    border: 'border-primary',
                    icon: Info,
                    iconColor: 'text-primary',
                };
        }
    };

    const styles = getToastStyles();
    const Icon = styles.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`${styles.bg} ${styles.border} border-l-4 rounded-lg shadow-xl p-4 flex items-start gap-3 min-w-[320px] backdrop-blur-sm`}
        >
            <div className={`shrink-0 ${styles.iconColor}`}>
                <Icon className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm mb-1">
                    {toast.title}
                </h3>
                {toast.message && (
                    <p className="text-foreground-muted text-sm">
                        {toast.message}
                    </p>
                )}
            </div>

            <button
                onClick={() => onClose(toast.id)}
                className="shrink-0 text-foreground-muted hover:text-foreground transition-colors"
                aria-label="Close toast"
            >
                <X className="h-4 w-4" />
            </button>
        </motion.div>
    );
}
