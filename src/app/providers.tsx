'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@/components/ui/use-toast';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            {children}
            <Toaster />
        </SessionProvider>
    );
}