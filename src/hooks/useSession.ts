import { useState, useEffect, useCallback } from 'react';
import { Session, SessionStatus } from '@/types/session';
import { Document } from '@/types/document';

interface UseSessionOptions {
    sessionId: string;
    autoRefresh?: boolean;
    refreshInterval?: number;
}

export function useSession(options: UseSessionOptions) {
    const { sessionId, autoRefresh = false, refreshInterval = 2000 } = options;

    const [session, setSession] = useState<Session | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSession = useCallback(async () => {
        try {
            const response = await fetch(`/api/session/${sessionId}`);
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Erreur lors de la récupération de la session');
            }

            setSession(data.data);

            if (data.data.documents) {
                setDocuments(data.data.documents);
            }

            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setIsLoading(false);
        }
    }, [sessionId]);

    useEffect(() => {
        fetchSession();
    }, [fetchSession]);

    // Auto-refresh pour suivre la progression
    useEffect(() => {
        if (!autoRefresh || !session) return;

        // Ne pas rafraîchir si la session est terminée ou en erreur
        if (session.status === 'ready' || session.status === 'expired' || session.status === 'error') {
            return;
        }

        const interval = setInterval(() => {
            fetchSession();
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval, session, fetchSession]);

    const updateDocument = useCallback(async (documentId: string, updates: Partial<Document>) => {
        try {
            const response = await fetch('/api/session/update', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    documentId,
                    ...updates,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Erreur lors de la mise à jour');
            }

            // Mettre à jour localement
            setDocuments(prev =>
                prev.map(doc =>
                    doc.id === documentId ? { ...doc, ...updates } : doc
                )
            );

            return data.data;
        } catch (err) {
            throw err;
        }
    }, []);

    const deleteSession = useCallback(async () => {
        try {
            const response = await fetch(`/api/session/${sessionId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Erreur lors de la suppression');
            }

            return true;
        } catch (err) {
            throw err;
        }
    }, [sessionId]);

    const isProcessing = session?.status === 'uploading' ||
        session?.status === 'processing' ||
        session?.status === 'extracting' ||
        session?.status === 'classifying';

    const isReady = session?.status === 'ready';
    const isExpired = session?.status === 'expired';
    const hasError = session?.status === 'error';

    const progress = session
        ? Math.round((session.processedFiles / session.totalFiles) * 100)
        : 0;

    return {
        session,
        documents,
        isLoading,
        error,
        isProcessing,
        isReady,
        isExpired,
        hasError,
        progress,
        refetch: fetchSession,
        updateDocument,
        deleteSession,
    };
}