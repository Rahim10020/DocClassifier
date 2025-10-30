import React from 'react';
import Link from 'next/link';
import { FolderTree } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
    className?: string;
}

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
    const sizes = {
        sm: 'h-6 w-6',
        md: 'h-8 w-8',
        lg: 'h-10 w-10',
    };

    const textSizes = {
        sm: 'text-lg',
        md: 'text-xl',
        lg: 'text-2xl',
    };

    return (
        <Link
            href="/"
            className={cn('flex items-center gap-2 font-bold text-foreground hover:opacity-80 transition-opacity', className)}
        >
            <div className="flex items-center justify-center bg-primary text-white rounded-lg p-1.5">
                <FolderTree className={sizes[size]} />
            </div>
            {showText && (
                <span className={textSizes[size]}>
                    Classifier
                </span>
            )}
        </Link>
    );
}