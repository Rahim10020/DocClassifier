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
                'sticky top-0 z-50 w-full backdrop-blur-xl bg-background-elevated/80',
                'shadow-sm transition-shadow duration-300',
                className
            )}
        >
            <div className="container mx-auto flex h-16 items-center justify-between px-6">
                <Logo size="md" />

                <div className="flex items-center gap-4">
                    {children}
                    {showLanguageSwitch && <LanguageSwitch />}
                </div>
            </div>
        </header>
    );
}