import React from 'react';
import { Github, Twitter, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FooterProps {
    className?: string;
}

export function Footer({ className }: FooterProps) {
    return (
        <footer className={cn('border-t border-border bg-background', className)}>
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* About */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-3">Classifier</h3>
                        <p className="text-sm text-foreground-muted">
                            Classifiez automatiquement vos documents en toute simplicité. Rapide, sécurisé et sans inscription.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-3">Liens utiles</h3>
                        <ul className="space-y-2 text-sm text-foreground-muted">
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    Comment ça marche
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    FAQ
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    Confidentialité
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">
                                    Conditions d&apos;utilisation
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-3">Contact</h3>
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
                </div>

                <div className="mt-8 pt-8 border-t border-border text-center text-sm text-foreground-muted">
                    <p>© {new Date().getFullYear()} Classifier. Tous droits réservés.</p>
                </div>
            </div>
        </footer>
    );
}