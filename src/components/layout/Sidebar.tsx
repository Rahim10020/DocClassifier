'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Upload, FolderArchive, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';

const navItems = [
    { name: 'Télécharger', href: '/upload', icon: Upload },
    { name: 'Profil', href: '/profile', icon: User },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <aside
            className={cn(
                'glass-card h-screen sticky top-0 p-4 transition-all duration-300 border-r border-border/40',
                isCollapsed ? 'w-16' : 'w-64'
            )}
        >
            {/* Logo et bouton de collapse */}
            <div className="flex items-center justify-between mb-8">
                <div className={cn('flex items-center space-x-2', isCollapsed && 'hidden')}>
                    <img
                        src="/images/logo.svg"
                        alt="DocClassifier"
                        className="h-8 w-8"
                    />
                    <span className="font-bold text-lg">DocClassifier</span>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 hover:bg-background/50 rounded-lg"
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'flex items-center p-3 rounded-lg transition-all duration-200 group',
                            pathname === item.href
                                ? 'bg-gradient-to-r from-primary to-primary-gradient text-white shadow-lg'
                                : 'hover:bg-background/50 text-muted-foreground hover:text-foreground'
                        )}
                    >
                        <item.icon className={cn('h-5 w-5 flex-shrink-0', !isCollapsed && 'mr-3')} />
                        {!isCollapsed && (
                            <span className="font-medium">{item.name}</span>
                        )}
                        {isCollapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-background border rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                <span className="text-sm font-medium">{item.name}</span>
                            </div>
                        )}
                    </Link>
                ))}
            </nav>

            {/* Informations supplémentaires */}
            {!isCollapsed && (
                <div className="mt-8 p-4 bg-background/30 rounded-lg border border-border/40">
                    <p className="text-xs text-muted-foreground text-center">
                        Version 1.0.0
                    </p>
                </div>
            )}
        </aside>
    );
}