import { ReactNode } from 'react';
import SimpleHeader from '@/components/layout/SimpleHeader';
import { requireAuth } from '@/lib/auth/session';

export default async function SimpleLayout({ children }: { children: ReactNode }) {
    await requireAuth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <SimpleHeader />
            <main className="container mx-auto px-6 py-12 max-w-6xl">
                {children}
            </main>
        </div>
    );
}