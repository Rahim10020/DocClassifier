import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { ClassificationStatus } from '@/types/classification';
import { cn } from '@/lib/utils/cn';

/**
 * Status badge component for displaying classification status
 */

interface StatusBadgeProps {
    status: ClassificationStatus;
    className?: string;
    showIcon?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
    [ClassificationStatus.PROCESSING]: {
        label: 'Processing',
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: '⏳',
    },
    [ClassificationStatus.READY]: {
        label: 'Ready',
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: '✅',
    },
    [ClassificationStatus.VALIDATED]: {
        label: 'Validated',
        className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        icon: '✔️',
    },
    [ClassificationStatus.DOWNLOADED]: {
        label: 'Downloaded',
        className: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: '📥',
    },
    [ClassificationStatus.EXPIRED]: {
        label: 'Expired',
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: '⏰',
    },
} as const;

export function StatusBadge({
    status,
    className,
    showIcon = true,
    size = 'md'
}: StatusBadgeProps) {
    const config = statusConfig[status];

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-sm',
        lg: 'px-3 py-1 text-base',
    };

    return (
        <Badge
            variant="outline"
            className={cn(
                config.className,
                sizeClasses[size],
                'font-medium inline-flex items-center gap-1',
                className
            )}
        >
            {showIcon && <span className="text-xs">{config.icon}</span>}
            {config.label}
        </Badge>
    );
}

/**
 * Status badge with animated processing indicator
 */
export function AnimatedStatusBadge({
    status,
    className,
    showIcon = true,
    size = 'md'
}: StatusBadgeProps) {
    const [dots, setDots] = React.useState('');

    React.useEffect(() => {
        if (status === ClassificationStatus.PROCESSING) {
            const interval = setInterval(() => {
                setDots(prev => prev.length >= 3 ? '' : prev + '.');
            }, 500);

            return () => clearInterval(interval);
        }
    }, [status]);

    const config = statusConfig[status];
    const displayLabel = status === ClassificationStatus.PROCESSING
        ? `Processing${dots}`
        : config.label;

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-sm',
        lg: 'px-3 py-1 text-base',
    };

    return (
        <Badge
            variant="outline"
            className={cn(
                config.className,
                sizeClasses[size],
                'font-medium inline-flex items-center gap-1',
                className
            )}
        >
            {showIcon && (
                <span className={cn(
                    'text-xs',
                    status === ClassificationStatus.PROCESSING && 'animate-pulse'
                )}>
                    {config.icon}
                </span>
            )}
            {displayLabel}
        </Badge>
    );
}

/**
 * Compact status indicator for tight spaces
 */
export function StatusIndicator({ status, className }: { status: ClassificationStatus; className?: string }) {
    const config = statusConfig[status];

    return (
        <div
            className={cn(
                'w-2 h-2 rounded-full',
                config.className,
                className
            )}
            title={config.label}
        />
    );
}

/**
 * Status badge with progress indicator for processing state
 */
export function StatusBadgeWithProgress({
    status,
    progress,
    className,
    showIcon = true,
    size = 'md'
}: StatusBadgeProps & { progress?: number }) {
    const config = statusConfig[status];

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-sm',
        lg: 'px-3 py-1 text-base',
    };

    return (
        <div className={cn('inline-flex items-center gap-2', className)}>
            <Badge
                variant="outline"
                className={cn(
                    config.className,
                    sizeClasses[size],
                    'font-medium inline-flex items-center gap-1'
                )}
            >
                {showIcon && <span className="text-xs">{config.icon}</span>}
                {config.label}
            </Badge>
            {progress !== undefined && (
                <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={cn(
                            'h-full transition-all duration-300',
                            status === ClassificationStatus.PROCESSING
                                ? 'bg-blue-500'
                                : 'bg-green-500'
                        )}
                        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                    />
                </div>
            )}
        </div>
    );
}