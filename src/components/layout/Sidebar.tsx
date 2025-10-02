'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Upload, FolderArchive, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Upload', href: '/upload', icon: Upload },
    { name: 'History', href: '/history', icon: FolderArchive },
    { name: 'Profile', href: '/profile', icon: User },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <aside
            className={cn(
                'glass-card h-screen sticky top-0 p-4 transition-all duration-300',
                isCollapsed ? 'w-16' : 'w-64'
            )}
        >
            <div className="flex items-center mb-8">
                <img
                    src="/images/logo.svg"
                    alt="DocClassifier"
                    className={cn('h-8', isCollapsed && 'hidden')}
                />
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="ml-auto p-2 hover:bg-background-secondary rounded"
                >
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={isCollapsed ? 'M4 6h16M4 12h16M4 18h16' : 'M6 18L18 6M6 6l12 12'}
                        />
                    </svg>
                </button>
            </div>
            <nav className="space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'flex items-center p-2 rounded-lg transition-colors',
                            pathname === item.href
                                ? 'bg-gradient-to-r from-primary to-primary-gradient text-white'
                                : 'hover:bg-background-secondary text-muted-foreground'
                        )}
                    >
                        <item.icon className="h-5 w-5 mr-3" />
                        {!isCollapsed && <span>{item.name}</span>}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}