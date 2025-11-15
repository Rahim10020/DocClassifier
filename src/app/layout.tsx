import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { ToastProvider } from '@/components/ui/toast';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ['latin'],
    weight: ['200', '300', '400', '500', '600', '700', '800'],
    variable: '--font-plus-jakarta-sans',
});

export const metadata: Metadata = {
    title: 'DocClassifier - Classification automatique de documents',
    description: 'Classifiez automatiquement vos documents en masse avec intelligence artificielle. Rapide, sécurisé et précis.',
    keywords: ['classification', 'documents', 'organisation', 'automatique', 'IA', 'intelligence artificielle', 'NLP'],
    authors: [{ name: 'DocClassifier' }],
    openGraph: {
        title: 'DocClassifier - Classification automatique de documents',
        description: 'Classifiez automatiquement vos documents en masse avec intelligence artificielle',
        type: 'website',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr" suppressHydrationWarning>
            <body className={`${plusJakartaSans.variable} font-sans antialiased bg-background text-foreground transition-colors duration-200`}>
                <SessionProvider>
                    <ThemeProvider>
                        <ErrorBoundary>
                            <ToastProvider>
                                {children}
                            </ToastProvider>
                        </ErrorBoundary>
                    </ThemeProvider>
                </SessionProvider>
            </body>
        </html>
    );
}