/**
 * @fileoverview Types pour les documents et leur classification.
 *
 * Ce module définit les interfaces et types pour la gestion des documents
 * uploadés, leur extraction de texte et leur classification.
 *
 * @module types/document
 * @author DocClassifier Team
 */

/**
 * Document stocké dans la base de données.
 * @interface Document
 */
export interface Document {
    id: string;
    sessionId: string;
    originalName: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    filePath: string;
    extractedText?: string;
    language?: string;
    mainCategory?: string;
    subCategory?: string;
    confidence?: number;
    keywords: string[];
    pageCount?: number;
    wordCount?: number;
    createdAt: Date;
}

/**
 * Document en cours d'upload avec état de progression.
 * @interface DocumentUpload
 */
export interface DocumentUpload {
    file: File;
    id: string;
    name: string;
    size: number;
    type: string;
    status: 'pending' | 'uploading' | 'uploaded' | 'error';
    progress?: number;
    error?: string;
}

/**
 * Résultat de l'extraction de texte d'un document.
 * @interface DocumentExtraction
 */
export interface DocumentExtraction {
    documentId: string;
    text: string;
    language: string;
    pageCount?: number;
    wordCount?: number;
    metadata?: Record<string, unknown>;
}

/**
 * Résultat de la classification d'un document.
 * @interface DocumentClassification
 */
export interface DocumentClassification {
    documentId: string;
    mainCategory: string;
    subCategory?: string;
    confidence: number;
    keywords: string[];
    alternativeCategories?: AlternativeCategory[];
    /** Indique si le document nécessite une revue humaine */
    needsReview?: boolean;
    /** Suggestion de catégorie provenant d'un fallback (LLM) ou heuristique */
    suggestedCategory?: string;
}

/**
 * Catégorie alternative suggérée par le classificateur.
 * @interface AlternativeCategory
 */
export interface AlternativeCategory {
    categoryId: string;
    categoryName: string;
    subCategory?: string;
    score: number;
    matchedKeywords: string[];
}

/**
 * Aperçu d'un document pour l'affichage.
 * @interface DocumentPreview
 */
export interface DocumentPreview {
    id: string;
    name: string;
    type: string;
    size: number;
    content: string;
    pageCount?: number;
    wordCount?: number;
}

/**
 * Types de fichiers supportés.
 * @typedef {string} FileType
 */
export type FileType = 'pdf' | 'docx' | 'doc' | 'txt' | 'md' | 'rtf' | 'xlsx' | 'xls' | 'csv' | 'odt' | 'ods';

/**
 * Mapping des extensions vers leurs types MIME acceptés.
 * @constant {Record<FileType, string[]>}
 */
export const ACCEPTED_FILE_TYPES: Record<FileType, string[]> = {
    pdf: ['application/pdf'],
    docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    doc: ['application/msword'],
    txt: ['text/plain'],
    md: ['text/markdown', 'text/x-markdown'],
    rtf: ['application/rtf', 'text/rtf'],
    xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    xls: ['application/vnd.ms-excel'],
    csv: ['text/csv'],
    odt: ['application/vnd.oasis.opendocument.text'],
    ods: ['application/vnd.oasis.opendocument.spreadsheet'],
};

/** Taille maximale d'un fichier : 50 MB */
export const MAX_FILE_SIZE = 50 * 1024 * 1024;
/** Taille maximale totale : 200 MB */
export const MAX_TOTAL_SIZE = 200 * 1024 * 1024;
/** Nombre maximum de fichiers par session */
export const MAX_FILES = 50;