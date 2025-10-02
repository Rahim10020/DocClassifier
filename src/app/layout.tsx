import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@/components/ui/use-toast';
import './globals.css';
import { cn } from '@/lib/utils/cn';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
    title: 'DocClassifier - Organize Your Documents',
    description: 'Intelligent document classification and organization tool',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" data-mode="dark">
            <body
                className={cn(
                    'min-h-screen bg-gradient-to-br from-background-dark to-background-secondary font-sans antialiased',
                    inter.variable
                )}
            >
                <SessionProvider>
                    {children}
                    <Toaster />
                </SessionProvider>
            </body>
        </html>
    );
}