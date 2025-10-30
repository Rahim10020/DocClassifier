import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
    const variants = {
        default: 'bg-primary text-white hover:bg-primary-hover',
        secondary: 'bg-background-secondary text-foreground hover:bg-background-tertiary',
        destructive: 'bg-error text-white hover:bg-error/90',
        outline: 'text-foreground border border-border',
        success: 'bg-success text-white',
        warning: 'bg-warning text-white',
    };

    return (
        <div
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                variants[variant],
                className
            )}
            {...props}
        />
    );
}

export { Badge };