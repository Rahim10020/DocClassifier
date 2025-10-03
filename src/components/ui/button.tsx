import * as React from 'react';
import { VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
    {
        variants: {
            variant: {
                default: 'bg-gradient-to-r from-primary to-primary-gradient text-white hover:brightness-110',
                destructive: 'bg-destructive text-white hover:bg-destructive/90',
                outline: 'border border-border bg-transparent hover:bg-background-secondary',
                ghost: 'hover:bg-background-secondary hover:text-accent',
                link: 'underline-offset-4 hover:underline text-primary',
            },
            size: {
                default: 'h-10 py-2 px-4',
                sm: 'h-9 px-3 rounded-md',
                lg: 'h-11 px-8 rounded-md',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, children, ...props }, ref) => {
        const buttonClasses = cn(buttonVariants({ variant, size, className }));

        if (asChild && children) {
            // When asChild is true, render children with button styling
            return (
                <span className={buttonClasses} {...props}>
                    {children}
                </span>
            );
        }

        return (
            <button
                className={buttonClasses}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';

export { Button, buttonVariants };