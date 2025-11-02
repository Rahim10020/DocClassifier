'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/shared/Header';
import { FinderView } from '@/components/classify/FinderView';
import { DownloadButton } from '@/components/download/DownloadButton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSession } from '@/hooks/useSession';
import { Category } from '@/types/category';
import { Document as DocumentType } from '@/types/document';
import { Loader2 } from 'lucide-react';

export default function ClassifyPage() {
    const params = useParams();
    const router = useRouter();
    const sessionId = params.sessionId as string;

    const { session, documents, isLoading, error, updateDocument } = useSession({
        sessionId,
        autoRefresh: false,
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const handleDocumentUpdate = async (
        documentId: string,
        updates: Partial<DocumentType>
    ) => {
        await updateDocument(documentId, updates);
    };

    useEffect(() => {
        const fetchTaxonomy = async () => {
            try {
                setLoadingCategories(true);
                const response = await fetch('/api/taxonomy');
                const data = await response.json();

                if (data.success) {
                    setCategories(data.data.categories);
                } else {
                    console.error('Error loading taxonomy:', data.error);
                }
            } catch (err) {
                console.error('Failed to fetch taxonomy:', err);
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchTaxonomy();
    }, []);

    if (isLoading || loadingCategories) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-foreground-muted font-medium">
                        {loadingCategories ? 'Chargement des catégories...' : 'Chargement...'}
                    </p>
                </div>
            </div>
        );
    }

    if (error || !session) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header />
                <main className="flex-1 flex items-center justify-center px-6">
                    <Card className="p-8 text-center max-w-md shadow-lg">
                        <p className="text-error mb-4 font-medium">{error || 'Session introuvable'}</p>
                        <Button onClick={() => router.push('/')}>Retour à l&apos;accueil</Button>
                    </Card>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header showLanguageSwitch={false}>
                <DownloadButton
                    sessionId={sessionId}
                    documentCount={documents.length}
                />
            </Header>

            <main className="flex-1 overflow-hidden">
                <FinderView
                    documents={documents}
                    categories={categories}
                    onUpdateDocument={handleDocumentUpdate}
                />
            </main>
        </div>
    );
}