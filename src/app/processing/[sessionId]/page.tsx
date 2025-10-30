'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/shared/Header';
import { StepIndicator } from '@/components/processing/StepIndicator';
import { ProgressBar } from '@/components/processing/ProgressBar';
import { ProcessingAnimation } from '@/components/processing/ProcessingAnimation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSession } from '@/hooks/useSession';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function ProcessingPage() {
    const router = useRouter();
    const params = useParams();
    const sessionId = params.sessionId as string;

    const {
        session,
        documents,
        isLoading,
        error,
        isProcessing,
        isReady,
        isExpired,
        hasError,
        progress,
    } = useSession({
        sessionId,
        autoRefresh: true,
        refreshInterval: 2000,
    });

    const [hasStartedProcessing, setHasStartedProcessing] = useState(false);

    // Démarrer l'extraction dès que la page se charge
    useEffect(() => {
        if (session && !hasStartedProcessing && session.status === 'uploading') {
            setHasStartedProcessing(true);
            startExtraction();
        }
    }, [session, hasStartedProcessing]);

    // Démarrer la classification après l'extraction
    useEffect(() => {
        if (session && session.status === 'extracting' && session.processedFiles === session.totalFiles) {
            startClassification();
        }
    }, [session]);

    // Rediriger vers classify quand prêt
    useEffect(() => {
        if (isReady) {
            setTimeout(() => {
                router.push(`/classify/${sessionId}`);
            }, 2000);
        }
    }, [isReady, sessionId, router]);

    const startExtraction = async () => {
        try {
            await fetch('/api/extract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId }),
            });
        } catch (error) {
            console.error('Extraction error:', error);
        }
    };

    const startClassification = async () => {
        try {
            await fetch('/api/classify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId }),
            });
        } catch (error) {
            console.error('Classification error:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-foreground-muted">Chargement...</p>
                </div>
            </div>
        );
    }

    if (error || !session) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header showLanguageSwitch={false} />
                <main className="flex-1 flex items-center justify-center px-4">
                    <Card className="p-8 max-w-md text-center">
                        <AlertCircle className="h-12 w-12 text-error mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-foreground mb-2">
                            Erreur
                        </h2>
                        <p className="text-foreground-muted mb-6">
                            {error || 'Session introuvable'}
                        </p>
                        <Button onClick={() => router.push('/')}>
                            Retour à l'accueil
                        </Button>
                    </Card>
                </main>
            </div>
        );
    }

    if (isExpired) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header showLanguageSwitch={false} />
                <main className="flex-1 flex items-center justify-center px-4">
                    <Card className="p-8 max-w-md text-center">
                        <AlertCircle className="h-12 w-12 text-warning mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-foreground mb-2">
                            Session expirée
                        </h2>
                        <p className="text-foreground-muted mb-6">
                            Cette session a expiré. Veuillez recommencer.
                        </p>
                        <Button onClick={() => router.push('/')}>
                            Nouvelle session
                        </Button>
                    </Card>
                </main>
            </div>
        );
    }

    if (isReady) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header showLanguageSwitch={false} />
                <main className="flex-1 flex items-center justify-center px-4">
                    <Card className="p-8 max-w-md text-center animate-in zoom-in">
                        <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
                        <h2 className="text-2xl font-semibold text-foreground mb-2">
                            🎉 Classification terminée !
                        </h2>
                        <p className="text-foreground-muted mb-6">
                            Tous vos documents ont été classifiés avec succès.
                        </p>
                        <p className="text-sm text-foreground-muted mb-6">
                            Redirection automatique...
                        </p>
                        <Button onClick={() => router.push(`/classify/${sessionId}`)}>
                            Voir les résultats
                        </Button>
                    </Card>
                </main>
            </div>
        );
    }

    const getMessage = () => {
        if (session.status === 'extracting') {
            return 'Extraction du contenu des documents...';
        }
        if (session.status === 'classifying') {
            return 'Classification intelligente en cours...';
        }
        return 'Traitement en cours...';
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header showLanguageSwitch={false} />

            <main className="flex-1 container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Title */}
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            Analyse de vos documents
                        </h1>
                        <p className="text-foreground-muted">
                            Veuillez patienter pendant que nous traitons vos fichiers
                        </p>
                    </div>

                    {/* Steps */}
                    <StepIndicator currentStatus={session.status} />

                    {/* Progress */}
                    <ProgressBar
                        current={session.processedFiles}
                        total={session.totalFiles}
                        message={getMessage()}
                    />

                    {/* Animation */}
                    {documents.length > 0 && (
                        <ProcessingAnimation
                            documents={documents}
                            processedCount={session.processedFiles}
                        />
                    )}

                    {/* Info */}
                    <Card className="p-4 bg-background-secondary border-border">
                        <p className="text-sm text-foreground-muted text-center">
                            💡 <strong>Astuce:</strong> Ne fermez pas cette page pendant le traitement.
                            La classification prend généralement quelques secondes par document.
                        </p>
                    </Card>
                </div>
            </main>
        </div>
    );
}