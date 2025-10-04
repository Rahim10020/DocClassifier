'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function Breadcrumb() {
    const pathname = usePathname();
    const paths = pathname.split('/').filter((p) => p);

    return (
        <nav className="flex items-center space-x-2 text-sm">
            <Link href="/upload" className="flex items-center hover:text-primary">
                <Home className="h-4 w-4 mr-1" />
                <span className="hidden md:inline">Home</span>
            </Link>
            {paths.map((path, index) => {
                const href = `/${paths.slice(0, index + 1).join('/')}`;
                const isLast = index === paths.length - 1;
                return (
                    <span key={href} className="flex items-center">
                        <span className="mx-1">/</span>
                        {isLast ? (
                            <span className="capitalize">{path}</span>
                        ) : (
                            <Link href={href} className="capitalize hover:text-primary">
                                {path}
                            </Link>
                        )}
                    </span>
                );
            })}
        </nav>
    );
}