import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, FolderArchive } from 'lucide-react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/session';
import prisma from '@/lib/db/prisma';
import { ClassificationWithDocuments } from '@/types/classification';
import EmptyState from '@/components/common/EmptyState';

export default async function DashboardPage() {
    const user = await getCurrentUser();
    if (!user) return null;

    const recentClassifications = await prisma.classification.findMany({
        where: { userId: user.id },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { documents: true },
    }) as ClassificationWithDocuments[];

    const stats = [
        { label: 'Total Classifications', value: await prisma.classification.count({ where: { userId: user.id } }) },
        { label: 'Total Documents', value: await prisma.documentMetadata.count({ where: { classification: { userId: user.id } } }) },
        { label: 'Storage Used', value: '0 MB' }, // Placeholder, as files are temporary
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold animate-fade-in">Welcome back, {user.name || user.email}</h1>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.label} className="p-6 animate-slide-in">
                        <h3 className="text-lg font-semibold">{stat.label}</h3>
                        <p className="text-2xl font-bold text-primary">{stat.value}</p>
                    </Card>
                ))}
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: 'Upload Documents', href: '/upload', icon: Upload },
                        { label: 'View History', href: '/history', icon: FolderArchive },
                        { label: 'Review Classifications', href: '/review', icon: FileText },
                    ].map((action) => (
                        <Card key={action.href} className="p-6">
                            <action.icon className="h-8 w-8 text-primary mb-4" />
                            <h3 className="text-lg font-semibold mb-2">{action.label}</h3>
                            <Button asChild variant="outline">
                                <Link href={action.href}>Go</Link>
                            </Button>
                        </Card>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-4">Recent Classifications</h2>
                {recentClassifications.length === 0 ? (
                    <EmptyState title="No Recent Classifications" description="Start by uploading some documents!" />
                ) : (
                    <div className="space-y-4">
                        {recentClassifications.map((classification) => (
                            <Card key={classification.id} className="p-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-semibold">Classification #{classification.id.slice(0, 8)}</h3>
                                        <p className="text-muted-foreground">
                                            {classification.totalDocuments} documents • Created{' '}
                                            {new Date(classification.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <Button asChild variant="ghost">
                                        <Link href={`/history/${classification.id}`}>View Details</Link>
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}