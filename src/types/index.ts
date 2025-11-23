/**
 * @fileoverview Point d'entrée pour tous les types de l'application.
 *
 * @module types
 * @author DocClassifier Team
 */

export * from './category';
export * from './document';
export * from './session';

/**
 * Réponse API générique.
 * @interface ApiResponse
 * @template T Type des données retournées
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

/**
 * Erreur API avec détails.
 * @interface ApiError
 */
export interface ApiError {
    message: string;
    code?: string;
    details?: unknown;
}

/**
 * Réponse paginée générique.
 * @interface PaginatedResponse
 * @template T Type des éléments
 */
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

/**
 * Filtres de recherche de documents.
 * @interface SearchFilters
 */
export interface SearchFilters {
    query?: string;
    category?: string;
    fileType?: string;
    minConfidence?: number;
    maxConfidence?: number;
}

/**
 * Options de tri.
 * @interface SortOptions
 */
export interface SortOptions {
    field: string;
    direction: 'asc' | 'desc';
}