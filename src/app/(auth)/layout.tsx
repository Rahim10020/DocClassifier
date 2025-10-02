import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className={cn('min-h-screen flex flex-col bg-gradient-to-br from-background-dark to-background-secondary animate-slide-in')}>
            <header className="p-4">
                <img src="/images/logo.svg" alt="DocClassifier" className="h-8" />
            </header>
            <main className="flex-1 flex items-center justify-center">{children}</main>
            <footer className="p-4 text-center text-sm text-muted-foreground">
                © 2023 DocClassifier. All rights reserved.
            </footer>
        </div>
    );
}