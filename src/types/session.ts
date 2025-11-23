/**
 * @fileoverview Types pour les sessions de classification.
 *
 * @module types/session
 * @author DocClassifier Team
 */

import { Document } from './document';

/**
 * Session de classification avec état et progression.
 * @interface Session
 */
export interface Session {
    id: string;
    createdAt: Date;
    expiresAt: Date;
    profile: string | null;
    language: string;
    totalFiles: number;
    processedFiles: number;
    status: SessionStatus;
    documents?: Document[];
}

/**
 * Statuts possibles d'une session.
 * @typedef {string} SessionStatus
 */
export type SessionStatus = 'uploading' | 'processing' | 'extracting' | 'classifying' | 'ready' | 'expired' | 'error';

/**
 * Session avec ses documents inclus.
 * @interface SessionWithDocuments
 */
export interface SessionWithDocuments extends Session {
    documents: Document[];
}

/**
 * État de progression d'une session.
 * @interface SessionProgress
 */
export interface SessionProgress {
    sessionId: string;
    status: SessionStatus;
    totalFiles: number;
    processedFiles: number;
    currentStep: ProcessingStep;
    message?: string;
    error?: string;
}

/**
 * Étape de traitement avec son état.
 * @interface ProcessingStep
 */
export interface ProcessingStep {
    name: string;
    status: 'pending' | 'processing' | 'completed' | 'error';
    progress?: number;
    message?: string;
}

/**
 * Données pour créer une session.
 * @interface SessionCreate
 */
export interface SessionCreate {
    profile?: string;
    language?: string;
    files: File[];
}

/**
 * Données pour mettre à jour une session.
 * @interface SessionUpdate
 */
export interface SessionUpdate {
    sessionId: string;
    documents?: Partial<Document>[];
    status?: SessionStatus;
}

/**
 * Options d'export pour le téléchargement.
 * @interface ExportOptions
 */
export interface ExportOptions {
    includeReadme: boolean;
    structure: 'flat' | 'hierarchical';
    format: 'zip';
}

/**
 * Requête de téléchargement.
 * @interface DownloadRequest
 */
export interface DownloadRequest {
    sessionId: string;
    options: ExportOptions;
}