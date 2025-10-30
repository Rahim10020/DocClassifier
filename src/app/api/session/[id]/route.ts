import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, deleteSession as deleteSessionStorage } from '@/lib/session';
import { deleteSession as deleteSessionFiles } from '@/lib/storage';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const sessionId = params.id;

        const session = await getSession(sessionId);

        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Session non trouvée' },
                { status: 404 }
            );
        }

        // Vérifier si la session est expirée
        if (session.status === 'expired') {
            return NextResponse.json(
                { success: false, error: 'Session expirée' },
                { status: 410 }
            );
        }

        return NextResponse.json({
            success: true,
            data: session,
        });
    } catch (error) {
        console.error('Get session error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erreur lors de la récupération de la session',
            },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const sessionId = params.id;

        // Vérifier que la session existe
        const session = await prisma.session.findUnique({
            where: { id: sessionId },
        });

        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Session non trouvée' },
                { status: 404 }
            );
        }

        // Supprimer les fichiers du disque
        await deleteSessionFiles(sessionId);

        // Supprimer la session de la base de données
        await deleteSessionStorage(sessionId);

        return NextResponse.json({
            success: true,
            message: 'Session supprimée avec succès',
        });
    } catch (error) {
        console.error('Delete session error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erreur lors de la suppression de la session',
            },
            { status: 500 }
        );
    }
}