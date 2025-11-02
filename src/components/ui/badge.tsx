import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
    const variants = {
        default: 'bg-primary text-white shadow-sm hover:bg-primary-hover',
        secondary: 'bg-background-secondary text-foreground hover:bg-background-tertiary shadow-xs',
        destructive: 'bg-error text-white shadow-sm',
        outline: 'text-foreground bg-background-elevated shadow-xs',
        success: 'bg-success text-white shadow-sm',
        warning: 'bg-warning text-white shadow-sm',
    };

    return (
        <div
            className={cn(
                'inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                variants[variant],
                className
            )}
            {...props}
        />
    );
}

export { Badge };