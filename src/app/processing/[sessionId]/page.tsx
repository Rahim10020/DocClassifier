'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/shared/Header';
import { StepIndicator } from '@/components/processing/StepIndicator';
import { ProgressBar } from '@/components/processing/ProgressBar';
import { ProcessingAnimation } from '@/components/processing/ProcessingAnimation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSession } from '@/hooks/useSession';
import { CheckCircle2, AlertCircle, Loader2, Lightbulb } from 'lucide-react';

export default function ProcessingPage() {
    const router = useRouter();
    const params = useParams();
    const sessionId = params.sessionId as string;

    const {
        session,
        documents,
        failedDocuments,
        isLoading,
        error,
        isReady,
        isExpired,
    } = useSession({
        sessionId,
        autoRefresh: true,
        refreshInterval: 2000,
    });

    const [hasStartedProcessing, setHasStartedProcessing] = useState(false);
    const [extractionComplete, setExtractionComplete] = useState(false);

    const startExtraction = useCallback(async () => {
        try {
            console.log('🚀 Démarrage de l\'extraction...');
            const response = await fetch('/api/extract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId }),
            });

            const data = await response.json();
            console.log('✅ Extraction API response:', data);
        } catch (error) {
            console.error('❌ Extraction error:', error);
        }
    }, [sessionId]);

    const startClassification = useCallback(async () => {
        try {
            console.log('🚀 Démarrage de la classification...');
            const response = await fetch('/api/classify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId }),
            });

            const data = await response.json();
            console.log('✅ Classification API response:', data);
        } catch (error) {
            console.error('❌ Classification error:', error);
        }
    }, [sessionId]);

    // Démarrer l'extraction UNE SEULE FOIS
    useEffect(() => {
        if (session && !hasStartedProcessing && session.status === 'uploading') {
            setHasStartedProcessing(true);
            startExtraction();
        }
    }, [session, hasStartedProcessing, startExtraction]);

    // DÉTECTER LA FIN DE L'EXTRACTION
    useEffect(() => {
        if (
            session &&
            session.status === 'extracting' &&
            session.processedFiles === session.totalFiles &&
            !extractionComplete
        ) {
            setExtractionComplete(true);
            console.log('✅ Extraction terminée, démarrage de la classification...');

            setTimeout(() => {
                startClassification();
            }, 1000);
        }
    }, [session, extractionComplete, startClassification]);

    // Rediriger vers classify quand prêt
    useEffect(() => {
        if (isReady) {
            setTimeout(() => {
                router.push(`/classify/${sessionId}`);
            }, 2000);
        }
    }, [isReady, sessionId, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-foreground-muted font-medium">Chargement...</p>
                </div>
            </div>
        );
    }

    if (error || !session) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header showLanguageSwitch={false} />
                <main className="flex-1 flex items-center justify-center px-6">
                    <Card className="p-10 max-w-md text-center shadow-xl">
                        <div className="w-16 h-16 bg-error-light rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="h-8 w-8 text-error" />
                        </div>
                        <h2 className="text-2xl font-semibold text-foreground mb-3">
                            Erreur
                        </h2>
                        <p className="text-foreground-muted mb-8">
                            {error || 'Session introuvable'}
                        </p>
                        <Button onClick={() => router.push('/')} size="lg">
                            Retour à l'accueil
                        </Button>
                    </Card>
                </main>
            </div>
        );
    }

    if (isExpired) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header showLanguageSwitch={false} />
                <main className="flex-1 flex items-center justify-center px-6">
                    <Card className="p-10 max-w-md text-center shadow-xl">
                        <div className="w-16 h-16 bg-warning-light rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="h-8 w-8 text-warning" />
                        </div>
                        <h2 className="text-2xl font-semibold text-foreground mb-3">
                            Session expirée
                        </h2>
                        <p className="text-foreground-muted mb-8">
                            Cette session a expiré. Veuillez recommencer.
                        </p>
                        <Button onClick={() => router.push('/')} size="lg">
                            Nouvelle session
                        </Button>
                    </Card>
                </main>
            </div>
        );
    }

    if (isReady) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header showLanguageSwitch={false} />
                <main className="flex-1 flex items-center justify-center px-6">
                    <Card className="p-10 max-w-md text-center shadow-2xl animate-scale-in">
                        <div className="w-20 h-20 bg-success-light rounded-2xl flex items-center justify-center mx-auto mb-6 animate-bounce">
                            <CheckCircle2 className="h-10 w-10 text-success" />
                        </div>
                        <h2 className="text-3xl font-bold text-foreground mb-3">
                            🎉 Classification terminée !
                        </h2>
                        <p className="text-foreground-muted mb-2 text-lg">
                            {session.totalFiles - failedDocuments.length} documents classifiés avec succès
                        </p>
                        {failedDocuments.length > 0 && (
                            <p className="text-sm text-error mb-6 font-medium">
                                ⚠️ {failedDocuments.length} document(s) n&apos;ont pas pu être traités
                            </p>
                        )}
                        <p className="text-sm text-foreground-muted mb-8">
                            Redirection automatique...
                        </p>
                        <Button onClick={() => router.push(`/classify/${sessionId}`)} size="lg">
                            Voir les résultats maintenant
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

            <main className="flex-1 container mx-auto px-6 py-16">
                <div className="max-w-4xl mx-auto space-y-10">
                    {/* Title */}
                    <div className="text-center animate-fade-in">
                        <h1 className="text-4xl font-bold text-foreground mb-3">
                            Analyse de vos documents
                        </h1>
                        <p className="text-foreground-muted text-lg">
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
                            failedDocuments={failedDocuments}
                        />
                    )}

                    {/* Info */}
                    <Card className="p-6 bg-primary-light shadow-md">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0">
                                <Lightbulb className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-foreground font-medium">
                                    <strong>Astuce:</strong> Ne fermez pas cette page pendant le traitement.
                                    La classification prend généralement quelques secondes par document.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}