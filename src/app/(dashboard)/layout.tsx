import { ReactNode } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { cn } from '@/lib/utils/cn';
import { requireAuth } from '@/lib/auth/session';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    await requireAuth();

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-background-dark to-background-secondary">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 p-6 overflow-auto">{children}</main>
            </div>
        </div>
    );
}