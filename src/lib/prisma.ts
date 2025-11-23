/**
 * @fileoverview Instance singleton du client Prisma.
 *
 * Ce module crée et exporte une instance unique de PrismaClient
 * qui est réutilisée entre les requêtes pour éviter les problèmes
 * de connexion en développement (hot reload).
 *
 * En développement, le client est attaché à globalThis pour persister
 * entre les hot reloads de Next.js.
 *
 * @module lib/prisma
 * @author DocClassifier Team
 */

import { PrismaClient } from '@prisma/client';

/**
 * Référence globale pour le client Prisma.
 * Utilisé pour éviter les multiples instances en développement.
 * @type {Object}
 */
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

/**
 * Instance singleton du client Prisma.
 *
 * Configuration du logging :
 * - Development : query, error, warn
 * - Production : error uniquement
 *
 * @type {PrismaClient}
 */
export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

// Persister le client en développement pour le hot reload
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;