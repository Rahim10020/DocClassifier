import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, FolderTree, Download, Zap } from 'lucide-react';

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background-dark to-background-secondary">
            {/* Fixed Header */}
            <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/40 backdrop-blur-xl">
                <div className="flex items-center justify-between px-6 py-2 max-w-6xl mx-auto">
                    {/* Logo */}
                    <img
                        src="/images/docClassifier.png"
                        alt="DocClassifier"
                        className="h-9 w-42"
                    />
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3">
                        <Button asChild variant="outline" size="sm" className="rounded-full">
                            <Link href="/login">Log in</Link>
                        </Button>
                        <Button asChild size="sm" className="rounded-full">
                            <Link href="/upload">Get Started</Link>
                        </Button>
                    </div>
                </div>
            </header>

            <section className="py-20 text-center animate-fade-in pt-24">
                <div className="container mx-auto px-4">
                    <h1 className="text-5xl font-bold text-primary mb-6">
                        Organize Your Documents with Ease
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                        DocClassifier uses intelligent algorithms to automatically categorize your documents,
                        saving you time and effort.
                    </p>
                </div>
            </section>

            <section className="py-16 bg-background-secondary/50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <FileText className="h-10 w-10 text-primary" />,
                                title: 'Automatic Classification',
                                description: 'Smart algorithms categorize your documents instantly.',
                            },
                            {
                                icon: <FolderTree className="h-10 w-10 text-primary" />,
                                title: 'Interactive Review',
                                description: 'Easily review and adjust document organization.',
                            },
                            {
                                icon: <Download className="h-10 w-10 text-primary" />,
                                title: 'Organized Downloads',
                                description: 'Download your documents in structured ZIP files.',
                            },
                        ].map((feature, index) => (
                            <div key={index} className="glass-card p-6 rounded-lg animate-slide-in">
                                <div className="mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}