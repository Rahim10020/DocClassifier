import React from 'react';
import { Logo } from './Logo';
import { LanguageSwitch } from './LanguageSwitch';
import { cn } from '@/lib/utils';

interface HeaderProps {
    showLanguageSwitch?: boolean;
    className?: string;
    children?: React.ReactNode;
}

export function Header({ showLanguageSwitch = true, className, children }: HeaderProps) {
    return (
        <header
            className={cn(
                'sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
                className
            )}
        >
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Logo size="md" />

                <div className="flex items-center gap-4">
                    {children}
                    {showLanguageSwitch && <LanguageSwitch />}
                </div>
            </div>
        </header>
    );
}