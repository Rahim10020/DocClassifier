import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ['latin'],
    weight: ['200', '300', '400', '500', '600', '700', '800'],
    variable: '--font-plus-jakarta-sans',
});

export const metadata: Metadata = {
    title: 'Classifier - Classification automatique de documents',
    description: 'Classifiez automatiquement vos documents en masse. Rapide et sécurisé.',
    keywords: ['classification', 'documents', 'organisation', 'automatique', 'IA'],
    authors: [{ name: 'Classifier' }],
    openGraph: {
        title: 'Classifier - Classification automatique de documents',
        description: 'Classifiez automatiquement vos documents en masse',
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
            <body className={`${plusJakartaSans.variable} font-sans antialiased bg-background text-foreground`}>
                {children}
            </body>
        </html>
    );
}