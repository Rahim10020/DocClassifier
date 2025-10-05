import { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className={cn('min-h-screen flex flex-col bg-gradient-to-br from-background-dark to-background-secondary animate-slide-in')}>
            <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/40 backdrop-blur-xl">
                <div className="flex items-center justify-between px-6 py-2 max-w-6xl mx-auto">
                    {/* Logo */}
                    <img
                        src="/images/docClassifier.png"
                        alt="DocClassifier"
                        className="h-9 w-42"
                    />
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3">
                        <Button asChild size="sm" className="rounded-full">
                            <Link href="/upload">Get Started</Link>
                        </Button>
                    </div>
                </div>
            </header>
            <main className="flex-1 flex items-center justify-center">{children}</main>
            <footer className="p-4 text-center text-sm text-muted-foreground">
                © 2023 DocClassifier. All rights reserved.
            </footer>
        </div>
    );
}