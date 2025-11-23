/**
 * @fileoverview Module de gestion des sessions de classification.
 *
 * Ce module fournit les fonctions CRUD pour gérer les sessions de classification
 * dans la base de données. Il gère également l'expiration automatique des sessions.
 *
 * @module lib/session
 * @author DocClassifier Team
 */

import { prisma } from './prisma';
import { Session, SessionStatus } from '@/types/session';
import { calculateSessionExpiry } from './utils';

/**
 * Durée de vie d'une session en heures.
 * Configurable via SESSION_DURATION_HOURS (défaut: 2h).
 * @constant {number}
 */
const SESSION_DURATION_HOURS = parseInt(process.env.SESSION_DURATION_HOURS || '2');

/**
 * Crée une nouvelle session de classification.
 *
 * @async
 * @function createSession
 * @param {string} [profile] - Profil de classification (student, professional, etc.)
 * @param {string} [language='fr'] - Langue de la session
 * @returns {Promise<Session>} Session créée avec son ID unique
 *
 * @example
 * const session = await createSession('student', 'fr');
 * console.log(session.id); // ID unique généré
 */
export async function createSession(
    profile?: string,
    language: string = 'fr'
): Promise<Session> {
    const expiresAt = calculateSessionExpiry(SESSION_DURATION_HOURS);

    const session = await prisma.classificationSession.create({
        data: {
            profile,
            language,
            expiresAt,
            status: 'uploading',
        },
    });

    return session as unknown as Session;
}

/**
 * Récupère une session par son identifiant.
 *
 * Vérifie automatiquement l'expiration et met à jour le statut si nécessaire.
 * Inclut les documents associés à la session.
 *
 * @async
 * @function getSession
 * @param {string} sessionId - Identifiant de la session
 * @returns {Promise<Session | null>} Session avec documents ou null si inexistante
 */
export async function getSession(sessionId: string): Promise<Session | null> {
    const session = await prisma.classificationSession.findUnique({
        where: { id: sessionId },
        include: {
            documents: true,
        },
    });

    if (!session) return null;

    // Vérifier l'expiration
    if (new Date(session.expiresAt) < new Date()) {
        await updateSessionStatus(sessionId, 'expired');
        return { ...session, status: 'expired' as SessionStatus } as unknown as Session;
    }

    return session as unknown as Session;
}

/**
 * Met à jour le statut d'une session.
 *
 * Statuts possibles : 'uploading', 'processing', 'completed', 'error', 'expired'
 *
 * @async
 * @function updateSessionStatus
 * @param {string} sessionId - Identifiant de la session
 * @param {SessionStatus} status - Nouveau statut
 * @returns {Promise<void>}
 */
export async function updateSessionStatus(
    sessionId: string,
    status: SessionStatus
): Promise<void> {
    await prisma.classificationSession.update({
        where: { id: sessionId },
        data: { status },
    });
}

/**
 * Met à jour le nombre de fichiers traités dans une session.
 *
 * @async
 * @function updateSessionProgress
 * @param {string} sessionId - Identifiant de la session
 * @param {number} processedFiles - Nombre de fichiers traités
 * @returns {Promise<void>}
 */
export async function updateSessionProgress(
    sessionId: string,
    processedFiles: number
): Promise<void> {
    await prisma.classificationSession.update({
        where: { id: sessionId },
        data: { processedFiles },
    });
}

/**
 * Incrémente le compteur de fichiers traités de 1.
 *
 * @async
 * @function incrementProcessedFiles
 * @param {string} sessionId - Identifiant de la session
 * @returns {Promise<number>} Nouveau nombre de fichiers traités
 */
export async function incrementProcessedFiles(sessionId: string): Promise<number> {
    const session = await prisma.classificationSession.update({
        where: { id: sessionId },
        data: {
            processedFiles: {
                increment: 1,
            },
        },
    });

    return session.processedFiles;
}

/**
 * Supprime une session de la base de données.
 *
 * Note : Les documents associés sont également supprimés (cascade).
 *
 * @async
 * @function deleteSession
 * @param {string} sessionId - Identifiant de la session
 * @returns {Promise<void>}
 */
export async function deleteSession(sessionId: string): Promise<void> {
    await prisma.classificationSession.delete({
        where: { id: sessionId },
    });
}

/**
 * Supprime toutes les sessions expirées de la base de données.
 *
 * Appelé périodiquement par le job CRON de nettoyage.
 *
 * @async
 * @function cleanupExpiredSessions
 * @returns {Promise<number>} Nombre de sessions supprimées
 */
export async function cleanupExpiredSessions(): Promise<number> {
    const result = await prisma.classificationSession.deleteMany({
        where: {
            expiresAt: {
                lt: new Date(),
            },
        },
    });

    return result.count;
}

/**
 * Récupère tous les documents d'une session.
 *
 * @async
 * @function getSessionDocuments
 * @param {string} sessionId - Identifiant de la session
 * @returns {Promise<Document[]>} Liste des documents triés par date de création
 */
export async function getSessionDocuments(sessionId: string) {
    return await prisma.document.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' },
    });
}

/**
 * Met à jour le nombre total de fichiers d'une session.
 *
 * @async
 * @function updateSessionTotalFiles
 * @param {string} sessionId - Identifiant de la session
 * @param {number} totalFiles - Nombre total de fichiers uploadés
 * @returns {Promise<void>}
 */
export async function updateSessionTotalFiles(
    sessionId: string,
    totalFiles: number
): Promise<void> {
    await prisma.classificationSession.update({
        where: { id: sessionId },
        data: { totalFiles },
    });
}