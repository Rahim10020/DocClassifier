import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
            <Image
                src="/favicon.ico"
                alt="Classifier Logo"
                width={32}
                height={32}
                className={cn(sizes[size], 'rounded')}
            />
            {showText && (
                <span className={textSizes[size]}>
                    Classifier
                </span>
            )}
        </Link>
    );
}