import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, ArrowRight, CheckCircle, Zap } from 'lucide-react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/session';

export default async function HomePage() {
    const user = await getCurrentUser();
    if (!user) return null;

    return (
        <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-6 py-12">
                <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                    <Zap className="h-4 w-4" />
                    <span>Classification automatique de documents</span>
                </div>

                <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary-gradient bg-clip-text text-transparent leading-tight">
                    Téléchargez vos documents<br />
                    <span className="text-foreground">et laissez-nous faire le reste</span>
                </h1>

                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Notre système d'intelligence artificielle classe automatiquement vos documents
                    avec une précision exceptionnelle. Simple, rapide et efficace.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                    <Button asChild size="lg" className="text-lg px-8 py-6">
                        <Link href="/upload">
                            <Upload className="mr-2 h-5 w-5" />
                            Commencer maintenant
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>

                    <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                        <Link href="/profile">
                            <FileText className="mr-2 h-5 w-5" />
                            Voir mon profil
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8">
                <Card className="text-center p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="space-y-4">
                        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                            <Upload className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold">Téléchargement Simple</h3>
                        <p className="text-muted-foreground">
                            Glissez-déposez vos fichiers ou cliquez pour sélectionner.
                            Support de tous les formats populaires.
                        </p>
                    </CardContent>
                </Card>

                <Card className="text-center p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="space-y-4">
                        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold">Classification Automatique</h3>
                        <p className="text-muted-foreground">
                            Notre IA analyse et classe vos documents avec précision.
                            Pas besoin d'intervention manuelle.
                        </p>
                    </CardContent>
                </Card>

                <Card className="text-center p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="space-y-4">
                        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                            <FileText className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold">Résultats Instantanés</h3>
                        <p className="text-muted-foreground">
                            Recevez vos classifications en quelques secondes.
                            Téléchargez vos résultats organisés.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* CTA Section */}
            <div className="text-center py-12 bg-gradient-to-r from-primary/5 to-primary-gradient/5 rounded-2xl border border-primary/10">
                <h2 className="text-3xl font-bold mb-4">Prêt à commencer ?</h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                    Rejoignez des milliers d'utilisateurs qui font confiance à notre plateforme
                    pour la classification automatique de leurs documents.
                </p>
                <Button asChild size="lg" className="text-lg px-12 py-6">
                    <Link href="/upload">
                        <Upload className="mr-2 h-5 w-5" />
                        Télécharger mes documents
                    </Link>
                </Button>
            </div>
        </div>
    );
}