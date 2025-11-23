/**
 * @fileoverview Schémas de validation pour les sessions et documents.
 *
 * Ce module définit les schémas Zod pour valider les requêtes API
 * liées aux sessions, documents et téléchargements.
 *
 * @module validators/session-validator
 * @author DocClassifier Team
 */

import { z } from 'zod';

/**
 * Schéma de création de session.
 * @type {z.ZodObject}
 */
export const sessionCreateSchema = z.object({
    profile: z.enum(['student', 'professional', 'researcher', 'personal', 'auto']).optional(),
    language: z.enum(['fr', 'en']).default('fr'),
});

/**
 * Schéma de mise à jour de session.
 * @type {z.ZodObject}
 */
export const sessionUpdateSchema = z.object({
    sessionId: z.string().cuid(),
    documents: z.array(z.object({
        id: z.string().cuid(),
        mainCategory: z.string().optional(),
        subCategory: z.string().optional(),
        confidence: z.number().min(0).max(1).optional(),
    })).optional(),
    status: z.enum(['uploading', 'processing', 'extracting', 'classifying', 'ready', 'expired', 'error']).optional(),
});

/**
 * Schéma de mise à jour de document.
 * @type {z.ZodObject}
 */
export const documentUpdateSchema = z.object({
    id: z.string().cuid(),
    mainCategory: z.string().optional(),
    subCategory: z.string().optional(),
});

/**
 * Schéma de requête de téléchargement.
 * @type {z.ZodObject}
 */
export const downloadRequestSchema = z.object({
    sessionId: z.string().cuid(),
    options: z.object({
        includeReadme: z.boolean().default(true),
        structure: z.enum(['flat', 'hierarchical']).default('hierarchical'),
        format: z.literal('zip').default('zip'),
    }),
});

export type SessionCreateInput = z.infer<typeof sessionCreateSchema>;
export type SessionUpdateInput = z.infer<typeof sessionUpdateSchema>;
export type DocumentUpdateInput = z.infer<typeof documentUpdateSchema>;
export type DownloadRequestInput = z.infer<typeof downloadRequestSchema>;

/**
 * Valide un identifiant de session (format CUID).
 *
 * @function validateSessionId
 * @param {string} sessionId - Identifiant à valider
 * @returns {boolean} True si valide
 */
export function validateSessionId(sessionId: string): boolean {
    return z.string().cuid().safeParse(sessionId).success;
}

/**
 * Valide un identifiant de document (format CUID).
 *
 * @function validateDocumentId
 * @param {string} documentId - Identifiant à valider
 * @returns {boolean} True si valide
 */
export function validateDocumentId(documentId: string): boolean {
    return z.string().cuid().safeParse(documentId).success;
}