import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

        const variants = {
            default: 'bg-primary text-white shadow-sm hover:bg-primary-hover hover:shadow-md active:scale-95',
            destructive: 'bg-error text-white shadow-sm hover:bg-error/90 hover:shadow-md active:scale-95',
            outline: 'bg-background-elevated border-0 shadow-sm text-foreground hover:bg-background-secondary hover:shadow-md',
            secondary: 'bg-background-secondary text-foreground hover:bg-background-tertiary shadow-xs',
            ghost: 'hover:bg-background-secondary',
            link: 'text-primary underline-offset-4 hover:underline',
        };

        const sizes = {
            default: 'h-10 px-5 py-2',
            sm: 'h-9 rounded-lg px-4 text-sm',
            lg: 'h-11 rounded-xl px-8 text-base',
            icon: 'h-10 w-10',
        };

        return (
            <button
                className={cn(
                    baseStyles,
                    variants[variant],
                    sizes[size],
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);

Button.displayName = 'Button';

export { Button };