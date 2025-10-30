import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: number;
    max?: number;
    showLabel?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
    ({ className, value = 0, max = 100, showLabel = false, ...props }, ref) => {
        const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

        return (
            <div
                ref={ref}
                className={cn('relative w-full', className)}
                {...props}
            >
                <div className="h-2 w-full overflow-hidden rounded-full bg-background-tertiary">
                    <div
                        className="h-full bg-primary transition-all duration-300 ease-in-out"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                {showLabel && (
                    <span className="mt-1 text-xs text-foreground-muted">
                        {Math.round(percentage)}%
                    </span>
                )}
            </div>
        );
    }
);

Progress.displayName = 'Progress';

export { Progress };