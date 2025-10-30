import * as React from 'react';
import { cn } from '@/lib/utils';

interface DropdownMenuProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trigger: React.ReactNode;
    children: React.ReactNode;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
    open,
    onOpenChange,
    trigger,
    children,
}) => {
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onOpenChange(false);
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open, onOpenChange]);

    return (
        <div ref={ref} className="relative inline-block">
            <div onClick={() => onOpenChange(!open)}>{trigger}</div>
            {open && (
                <div className="absolute right-0 mt-2 w-56 rounded-md border border-border bg-card shadow-lg z-50 animate-in fade-in-0 zoom-in-95">
                    {children}
                </div>
            )}
        </div>
    );
};

const DropdownMenuContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('py-1', className)}
        {...props}
    />
));
DropdownMenuContent.displayName = 'DropdownMenuContent';

const DropdownMenuItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'relative flex cursor-pointer select-none items-center px-4 py-2 text-sm outline-none transition-colors hover:bg-background-secondary focus:bg-background-secondary',
            className
        )}
        {...props}
    />
));
DropdownMenuItem.displayName = 'DropdownMenuItem';

const DropdownMenuSeparator = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('my-1 h-px bg-border', className)}
        {...props}
    />
));
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

const DropdownMenuLabel = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('px-4 py-2 text-sm font-semibold text-foreground-muted', className)}
        {...props}
    />
));
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

export {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
};