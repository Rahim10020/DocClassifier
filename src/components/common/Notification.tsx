'use client';

import * as React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/**
 * Notification component for displaying alerts and messages
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationProps {
    type: NotificationType;
    title: string;
    message?: string;
    onClose?: () => void;
    className?: string;
    autoClose?: boolean;
    autoCloseDelay?: number;
    showIcon?: boolean;
}

const notificationConfig = {
    success: {
        icon: CheckCircle,
        className: 'bg-green-50 border-green-200 text-green-800',
        iconClassName: 'text-green-600',
    },
    error: {
        icon: AlertCircle,
        className: 'bg-red-50 border-red-200 text-red-800',
        iconClassName: 'text-red-600',
    },
    warning: {
        icon: AlertTriangle,
        className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        iconClassName: 'text-yellow-600',
    },
    info: {
        icon: Info,
        className: 'bg-blue-50 border-blue-200 text-blue-800',
        iconClassName: 'text-blue-600',
    },
} as const;

export function Notification({
    type,
    title,
    message,
    onClose,
    className,
    autoClose = false,
    autoCloseDelay = 5000,
    showIcon = true,
}: NotificationProps) {
    const [isVisible, setIsVisible] = React.useState(true);
    const config = notificationConfig[type];
    const IconComponent = config.icon;

    React.useEffect(() => {
        if (autoClose && autoCloseDelay > 0) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                onClose?.();
            }, autoCloseDelay);

            return () => clearTimeout(timer);
        }
    }, [autoClose, autoCloseDelay, onClose]);

    const handleClose = () => {
        setIsVisible(false);
        onClose?.();
    };

    if (!isVisible) return null;

    return (
        <div
            className={cn(
                'flex items-start gap-3 p-4 border rounded-lg shadow-sm',
                config.className,
                className
            )}
            role="alert"
        >
            {showIcon && (
                <IconComponent className={cn('w-5 h-5 mt-0.5 flex-shrink-0', config.iconClassName)} />
            )}

            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm">{title}</h4>
                {message && (
                    <p className="mt-1 text-sm opacity-90">{message}</p>
                )}
            </div>

            {onClose && (
                <button
                    onClick={handleClose}
                    className="flex-shrink-0 p-1 rounded-md hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    aria-label="Close notification"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}

/**
 * Toast notification hook for easy notification management
 */
export function useNotification() {
    const [notifications, setNotifications] = React.useState<Array<{
        id: string;
        type: NotificationType;
        title: string;
        message?: string;
        autoClose?: boolean;
        autoCloseDelay?: number;
    }>>([]);

    const addNotification = React.useCallback((
        type: NotificationType,
        title: string,
        message?: string,
        options?: {
            autoClose?: boolean;
            autoCloseDelay?: number;
        }
    ) => {
        const id = Math.random().toString(36).substr(2, 9);
        const notification = {
            id,
            type,
            title,
            message,
            autoClose: options?.autoClose ?? true,
            autoCloseDelay: options?.autoCloseDelay ?? 5000,
        };

        setNotifications(prev => [...prev, notification]);

        return id;
    }, []);

    const removeNotification = React.useCallback((id: string) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);

    const clearAllNotifications = React.useCallback(() => {
        setNotifications([]);
    }, []);

    const success = React.useCallback((title: string, message?: string, options?: Parameters<typeof addNotification>[3]) => {
        return addNotification('success', title, message, options);
    }, [addNotification]);

    const error = React.useCallback((title: string, message?: string, options?: Parameters<typeof addNotification>[3]) => {
        return addNotification('error', title, message, options);
    }, [addNotification]);

    const warning = React.useCallback((title: string, message?: string, options?: Parameters<typeof addNotification>[3]) => {
        return addNotification('warning', title, message, options);
    }, [addNotification]);

    const info = React.useCallback((title: string, message?: string, options?: Parameters<typeof addNotification>[3]) => {
        return addNotification('info', title, message, options);
    }, [addNotification]);

    return {
        notifications,
        addNotification,
        removeNotification,
        clearAllNotifications,
        success,
        error,
        warning,
        info,
    };
}

/**
 * Notification container component
 */
interface NotificationContainerProps {
    notifications: Array<{
        id: string;
        type: NotificationType;
        title: string;
        message?: string;
        autoClose?: boolean;
        autoCloseDelay?: number;
    }>;
    onRemove: (id: string) => void;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
    className?: string;
}

export function NotificationContainer({
    notifications,
    onRemove,
    position = 'top-right',
    className,
}: NotificationContainerProps) {
    const positionClasses = {
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    };

    if (notifications.length === 0) return null;

    return (
        <div
            className={cn(
                'fixed z-50 space-y-2 max-w-sm',
                positionClasses[position],
                className
            )}
        >
            {notifications.map((notification) => (
                <Notification
                    key={notification.id}
                    type={notification.type}
                    title={notification.title}
                    message={notification.message}
                    autoClose={notification.autoClose}
                    autoCloseDelay={notification.autoCloseDelay}
                    onClose={() => onRemove(notification.id)}
                />
            ))}
        </div>
    );
}