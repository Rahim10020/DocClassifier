import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, TrendingUp, Files, HardDrive } from 'lucide-react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/session';
import prisma from '@/lib/db/prisma';
import { ClassificationWithDocuments } from '@/types/classification';
import EmptyState from '@/components/common/EmptyState';
import StatsCard from '@/components/dashboard/StatsCard';
import { QuickActions } from '@/components/dashboard/QuickActions';

export default async function DashboardPage() {
    const user = await getCurrentUser();
    if (!user) return null;

    const recentClassifications = await prisma.classification.findMany({
        where: { userId: user.id },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { documents: true },
    }) as ClassificationWithDocuments[];

    const totalClassifications = await prisma.classification.count({ where: { userId: user.id } });
    const totalDocuments = await prisma.documentMetadata.count({ where: { classification: { userId: user.id } } });

    return (
        <div className="space-y-8">
            {/* En-tête de bienvenue */}
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-gradient bg-clip-text text-transparent">
                    Bonjour, {user.name || user.email} 👋
                </h1>
                <p className="text-muted-foreground text-lg">
                    Gérez vos documents et classifications avec facilité
                </p>
            </div>

            {/* Statistiques */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    title="Classifications Totales"
                    value={totalClassifications}
                    icon={TrendingUp}
                    trend={12}
                />
                <StatsCard
                    title="Documents Traités"
                    value={totalDocuments}
                    icon={Files}
                    trend={8}
                />
                <StatsCard
                    title="Espace Utilisé"
                    value="0 MB"
                    icon={HardDrive}
                />
            </section>

            {/* Actions rapides */}
            <section className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Quick Actions</h2>
                    <p className="text-muted-foreground">Quickly access the main features</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            label: 'Télécharger Documents',
                            href: '/upload',
                            icon: Upload,
                            description: 'Téléchargez et classez vos documents'
                        },
                        {
                            label: 'Réviser Classifications',
                            href: '/review',
                            icon: FileText,
                            description: 'Examinez et validez vos classifications'
                        },
                    ].map((action) => (
                        <Card key={action.href} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                            <CardHeader className="text-center pb-4">
                                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                    <action.icon className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle className="text-lg">{action.label}</CardTitle>
                                <p className="text-sm text-muted-foreground">{action.description}</p>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <Button asChild className="w-full" variant="outline">
                                    <Link href={action.href}>Commencer</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Classifications récentes */}
            <section className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Classifications Récentes</h2>
                    <p className="text-muted-foreground">Vos dernières activités de classification</p>
                </div>
                {recentClassifications.length === 0 ? (
                    <EmptyState
                        title="Aucune Classification Récente"
                        description="Commencez par télécharger quelques documents pour voir vos classifications ici !"
                    />
                ) : (
                    <div className="space-y-4">
                        {recentClassifications.map((classification) => (
                            <Card key={classification.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-center">
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-semibold">
                                                Classification #{classification.id.slice(0, 8)}
                                            </h3>
                                            <p className="text-muted-foreground">
                                                {classification.totalDocuments} documents • Créé le{' '}
                                                {new Date(classification.createdAt).toLocaleDateString('fr-FR')}
                                            </p>
                                        </div>
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/review/${classification.id}`}>
                                                Réviser
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}