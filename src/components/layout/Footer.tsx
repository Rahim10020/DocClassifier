import * as React from 'react';
import Link from 'next/link';
import { Heart, Github, Twitter, Linkedin } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { footerLinks, externalLinks } from '@/config/nav';

/**
 * Footer component for the application
 */

interface FooterProps {
    className?: string;
    variant?: 'default' | 'compact';
    showSocialLinks?: boolean;
    showBranding?: boolean;
}

export function Footer({
    className,
    variant = 'default',
    showSocialLinks = true,
    showBranding = true,
}: FooterProps) {
    const currentYear = new Date().getFullYear();

    if (variant === 'compact') {
        return (
            <footer className={cn('border-t border-border/40 bg-background-secondary/30 backdrop-blur-xl py-4', className)}>
                <div className="container mx-auto px-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        {showBranding && (
                            <div className="text-sm text-muted-foreground">
                                © {currentYear} Document Classifier. All rights reserved.
                            </div>
                        )}
                        <div className="flex items-center gap-4">
                            {showSocialLinks && (
                                <div className="flex items-center gap-3">
                                    <Link
                                        href={externalLinks.github}
                                        className="text-muted-foreground hover:text-primary transition-colors"
                                        aria-label="GitHub"
                                    >
                                        <Github className="w-4 h-4" />
                                    </Link>
                                    <Link
                                        href={externalLinks.twitter}
                                        className="text-muted-foreground hover:text-primary transition-colors"
                                        aria-label="Twitter"
                                    >
                                        <Twitter className="w-4 h-4" />
                                    </Link>
                                    <Link
                                        href={externalLinks.linkedin}
                                        className="text-muted-foreground hover:text-primary transition-colors"
                                        aria-label="LinkedIn"
                                    >
                                        <Linkedin className="w-4 h-4" />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </footer>
        );
    }

    return (
        <footer className={cn('bg-background-secondary/20 border-t border-border/40 backdrop-blur-xl', className)}>
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand section */}
                    {showBranding && (
                        <div className="md:col-span-2">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-primary">
                                        Document Classifier
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Intelligent document classification and organization system
                                        powered by AI and machine learning.
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    {showSocialLinks && (
                                        <>
                                            <Link
                                                href={externalLinks.github}
                                                className="text-muted-foreground hover:text-primary transition-colors"
                                                aria-label="GitHub"
                                            >
                                                <Github className="w-5 h-5" />
                                            </Link>
                                            <Link
                                                href={externalLinks.twitter}
                                                className="text-muted-foreground hover:text-primary transition-colors"
                                                aria-label="Twitter"
                                            >
                                                <Twitter className="w-5 h-5" />
                                            </Link>
                                            <Link
                                                href={externalLinks.linkedin}
                                                className="text-muted-foreground hover:text-primary transition-colors"
                                                aria-label="LinkedIn"
                                            >
                                                <Linkedin className="w-5 h-5" />
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Links sections */}
                    <div>
                        <h4 className="text-sm font-semibold text-primary mb-4">
                            Product
                        </h4>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    href="/features"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/pricing"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/integrations"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Integrations
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/api"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    API
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-primary mb-4">
                            Support
                        </h4>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    href="/help"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/contact"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/status"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    System Status
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/feedback"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Feedback
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom section */}
                <div className="mt-8 pt-8 border-t border-border/40">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="text-sm text-muted-foreground">
                            © {currentYear} Document Classifier. All rights reserved.
                        </div>

                        <div className="flex items-center gap-6">
                            <Link
                                href="/privacy"
                                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                href="/terms"
                                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                Terms of Service
                            </Link>
                            <Link
                                href="/cookies"
                                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                Cookie Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

/**
 * Simple footer for auth pages
 */
interface AuthFooterProps {
    className?: string;
}

export function AuthFooter({ className }: AuthFooterProps) {
    return (
        <footer className={cn('py-6 text-center bg-background-secondary/20 backdrop-blur-xl', className)}>
            <div className="text-sm text-muted-foreground">
                <span>Built with </span>
                <Heart className="w-4 h-4 inline text-primary" />
                <span> for better document management</span>
            </div>
        </footer>
    );
}

/**
 * Sticky footer for special layouts
 */
interface StickyFooterProps {
    children: React.ReactNode;
    className?: string;
}

export function StickyFooter({ children, className }: StickyFooterProps) {
    return (
        <footer className={cn('sticky bottom-0 bg-background-secondary/20 border-t border-border/40 backdrop-blur-xl p-4', className)}>
            {children}
        </footer>
    );
}