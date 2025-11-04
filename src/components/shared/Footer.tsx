import React from 'react';
import { Github, Twitter, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FooterProps {
    className?: string;
}

export function Footer({ className }: FooterProps) {
    return (
        <footer className={cn('border-t border-border bg-background', className)}>
            <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between">
                <p>© {new Date().getFullYear()} Classifier. Tous droits réservés.</p>
                <div className="flex gap-4">
                    <a
                        href="#"
                        className="text-foreground-muted hover:text-primary transition-colors"
                        aria-label="GitHub"
                    >
                        <Github className="h-5 w-5" />
                    </a>
                    <a
                        href="#"
                        className="text-foreground-muted hover:text-primary transition-colors"
                        aria-label="Twitter"
                    >
                        <Twitter className="h-5 w-5" />
                    </a>
                    <a
                        href="#"
                        className="text-foreground-muted hover:text-primary transition-colors"
                        aria-label="Email"
                    >
                        <Mail className="h-5 w-5" />
                    </a>
                </div>
            </div>
        </footer>
    );
}