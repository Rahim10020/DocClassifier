import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, FolderTree, Download, Zap } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background-dark to-background-secondary">
            <section className="py-20 text-center animate-fade-in">
                <div className="container mx-auto px-4">
                    <h1 className="text-5xl font-bold text-primary mb-6">
                        Organize Your Documents with Ease
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                        DocClassifier uses intelligent algorithms to automatically categorize your documents,
                        saving you time and effort.
                    </p>
                    <Button asChild size="lg" className="animate-slide-in">
                        <Link href="/dashboard">Get Started</Link>
                    </Button>
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