/**
 * @fileoverview API route pour la gestion des sessions par ID.
 *
 * Ce endpoint permet de récupérer ou supprimer une session
 * de classification spécifique.
 *
 * @module api/session/[id]
 * @author DocClassifier Team
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, deleteSession as deleteSessionStorage } from '@/lib/session';
import { deleteSession as deleteSessionFiles } from '@/lib/storage';
import { serializeBigInt } from '@/lib/utils';

/**
 * Récupération d'une session par son ID.
 *
 * Retourne les données complètes de la session incluant
 * tous ses documents. Vérifie si la session est expirée.
 *
 * @async
 * @function GET
 * @param {NextRequest} request - Requête entrante
 * @param {Object} context - Contexte avec paramètres de route
 * @returns {Promise<NextResponse>} Session avec documents ou erreur
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const sessionId = id;

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
            data: serializeBigInt(session),
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

/**
 * Suppression d'une session et de ses fichiers.
 *
 * Supprime la session de la base de données et tous les fichiers
 * associés du disque.
 *
 * @async
 * @function DELETE
 * @param {NextRequest} request - Requête entrante
 * @param {Object} context - Contexte avec paramètres de route
 * @returns {Promise<NextResponse>} Confirmation de suppression
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const sessionId = id;

        // Vérifier que la session existe
        const session = await prisma.classificationSession.findUnique({
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