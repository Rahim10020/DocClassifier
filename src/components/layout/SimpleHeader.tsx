'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Upload, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import UserMenu from '@/components/layout/UserMenu';

const navItems = [
    { name: 'Télécharger', href: '/upload', icon: Upload },
    { name: 'Profil', href: '/profile', icon: User },
];

export default function SimpleHeader() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 glass-card border-b border-border/40 backdrop-blur-xl">
            <div className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
                {/* Logo */}
                <img
                    src="/images/docclassifier.png"
                    alt="DocClassifier"
                    className="h-8 w-64"
                />

                {/* Navigation principale */}
                <nav className="hidden md:flex items-center space-x-1">
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant={pathname === item.href ? "default" : "ghost"}
                                className={cn(
                                    "flex items-center space-x-2 px-4 py-2",
                                    pathname === item.href && "bg-primary text-white"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                <span>{item.name}</span>
                            </Button>
                        </Link>
                    ))}
                </nav>

                {/* Menu utilisateur */}
                <div className="flex items-center space-x-4">
                    <UserMenu />
                </div>
            </div>

            {/* Navigation mobile */}
            <div className="md:hidden border-t border-border/40 px-6 py-3">
                <nav className="flex items-center justify-center space-x-4">
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant={pathname === item.href ? "default" : "ghost"}
                                size="sm"
                                className="flex items-center space-x-2"
                            >
                                <item.icon className="h-4 w-4" />
                                <span>{item.name}</span>
                            </Button>
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
}