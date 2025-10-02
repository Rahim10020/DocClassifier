import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> { }
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> { }
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> { }
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> { }
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> { }

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('glass-card rounded-lg shadow-pronounced', className)}
            {...props}
        />
    )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('flex flex-col space-y-1.5 p-6', className)}
            {...props}
        />
    )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, CardTitleProps>(
    ({ className, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
            {...props}
        />
    )
);
CardTitle.displayName = 'CardTitle';

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('p-6 pt-0', className)}
            {...props}
        />
    )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('flex items-center p-6 pt-0', className)}
            {...props}
        />
    )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardContent, CardTitle, CardFooter };