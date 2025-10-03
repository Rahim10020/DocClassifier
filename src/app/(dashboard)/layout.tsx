import { ReactNode } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { cn } from '@/lib/utils/cn';
import { requireAuth } from '@/lib/auth/session';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    await requireAuth();

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 overflow-auto">
                    <div className="container mx-auto px-6 py-8 max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}