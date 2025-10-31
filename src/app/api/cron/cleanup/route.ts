import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredSessions as cleanupSessionsDB } from '@/lib/session';
import { cleanupExpiredSessions as cleanupSessionsFiles } from '@/lib/storage';

/**
 * Endpoint CRON pour nettoyer les sessions expirées
 * Appelé automatiquement par Vercel toutes les 3 heures
 *
 * Sécurisé par CRON_SECRET défini dans les variables d'environnement
 */
export async function GET(request: NextRequest) {
    try {
        // Vérifier l'authentification via le secret CRON
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'CRON_SECRET non configuré'
                },
                { status: 500 }
            );
        }

        // Vérifier que le header Authorization contient le bon secret
        if (authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Non autorisé'
                },
                { status: 401 }
            );
        }

        // Nettoyer les sessions expirées en base de données
        const deletedSessionsCount = await cleanupSessionsDB();

        // Nettoyer les fichiers expirés sur le disque
        const deletedFilesCount = await cleanupSessionsFiles();

        return NextResponse.json({
            success: true,
            data: {
                deletedSessions: deletedSessionsCount,
                deletedFilesFolders: deletedFilesCount,
                timestamp: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error('Cleanup CRON error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erreur lors du nettoyage',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
