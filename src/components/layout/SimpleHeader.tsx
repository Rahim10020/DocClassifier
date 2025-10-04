'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import UserMenu from '@/components/layout/UserMenu';
import { signOut } from 'next-auth/react';

const navItems = [
    { name: 'Profil', href: '/profile', icon: User },
    { name: 'Déconnexion', href: '#', icon: LogOut, action: 'signout' },
];

export default function SimpleHeader() {
    const pathname = usePathname();

    const handleSignOut = () => {
        signOut({ callbackUrl: '/login' });
    };

    return (
        <header className="sticky top-0 z-50 glass-card border-b border-border/40 backdrop-blur-xl">
            <div className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
                {/* Logo */}
                <img
                    src="/images/docclassifier.png"
                    alt="DocClassifier"
                    className="h-8 w-32"
                />
                <div className="flex items-center space-x-4">
                    {/* Navigation desktop */}
                    <nav className="hidden md:flex items-center space-x-4">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const isSignOut = item.action === 'signout';

                            if (isSignOut) {
                                return (
                                    <button
                                        key={item.name}
                                        onClick={handleSignOut}
                                        className={cn(
                                            "flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors hover:text-primary",
                                            "relative group"
                                        )}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        <span>{item.name}</span>
                                    </button>
                                );
                            }

                            return (
                                <Link key={item.href} href={item.href}>
                                    <div className={cn(
                                        "flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors hover:text-primary",
                                        "relative group"
                                    )}>
                                        <item.icon className="h-4 w-4" />
                                        <span>{item.name}</span>
                                        {isActive && (
                                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Menu utilisateur */}
                    <div className="flex items-center space-x-4">
                        <UserMenu />
                    </div>
                </div>

            </div>

            {/* Navigation mobile */}
            <div className="md:hidden border-t border-border/40 px-6 py-3">
                <nav className="flex items-center justify-center space-x-4">
                    {navItems.map((item) => {
                        if (item.action === 'signout') {
                            return (
                                <Button
                                    key={item.name}
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleSignOut}
                                    className="flex items-center space-x-2"
                                >
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.name}</span>
                                </Button>
                            );
                        }

                        return (
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
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}