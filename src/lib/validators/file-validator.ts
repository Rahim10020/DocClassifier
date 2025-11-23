/**
 * @fileoverview Validation des fichiers uploadés.
 *
 * Ce module fournit des fonctions pour valider les fichiers avant leur
 * traitement : type MIME, extension, taille, et contraintes globales.
 *
 * @module validators/file-validator
 * @author DocClassifier Team
 */

import { z } from 'zod';
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE, MAX_TOTAL_SIZE, MAX_FILES } from '@/types/document';

/**
 * Erreur de validation d'un fichier.
 * @interface ValidationError
 */
export interface ValidationError {
    file: string;
    error: string;
}

/**
 * Résultat complet de la validation d'un ensemble de fichiers.
 * @interface ValidationResult
 */
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: string[];
}

const ACCEPTED_MIME_TYPES = Object.values(ACCEPTED_FILE_TYPES).flat();

/**
 * Valide un fichier individuel.
 *
 * Vérifie : type MIME, extension, taille, et que le fichier n'est pas vide.
 *
 * @function validateFile
 * @param {File} file - Fichier à valider
 * @returns {ValidationError | null} Erreur ou null si valide
 */
export function validateFile(file: File): ValidationError | null {
    // Vérifier le type MIME
    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
        return {
            file: file.name,
            error: `Type de fichier non supporté: ${file.type}`,
        };
    }

    // Vérifier l'extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !Object.keys(ACCEPTED_FILE_TYPES).includes(extension)) {
        return {
            file: file.name,
            error: `Extension de fichier non supportée: .${extension}`,
        };
    }

    // Vérifier la taille du fichier
    if (file.size > MAX_FILE_SIZE) {
        return {
            file: file.name,
            error: `Fichier trop volumineux (max ${MAX_FILE_SIZE / 1024 / 1024} MB)`,
        };
    }

    // Vérifier que le fichier n'est pas vide
    if (file.size === 0) {
        return {
            file: file.name,
            error: 'Le fichier est vide',
        };
    }

    return null;
}

/**
 * Valide un ensemble de fichiers.
 *
 * Vérifie : nombre de fichiers, taille totale, doublons, et chaque fichier.
 *
 * @function validateFiles
 * @param {File[]} files - Tableau de fichiers à valider
 * @returns {ValidationResult} Résultat avec erreurs et warnings
 */
export function validateFiles(files: File[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    // Vérifier le nombre de fichiers
    if (files.length === 0) {
        errors.push({
            file: 'global',
            error: 'Aucun fichier sélectionné',
        });
        return { valid: false, errors, warnings };
    }

    if (files.length > MAX_FILES) {
        errors.push({
            file: 'global',
            error: `Trop de fichiers (max ${MAX_FILES})`,
        });
    }

    // Vérifier la taille totale
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
        errors.push({
            file: 'global',
            error: `Taille totale trop importante (max ${MAX_TOTAL_SIZE / 1024 / 1024} MB)`,
        });
    }

    // Vérifier les doublons
    const fileNames = new Set<string>();
    files.forEach(file => {
        if (fileNames.has(file.name)) {
            warnings.push(`Fichier en double: ${file.name}`);
        }
        fileNames.add(file.name);
    });

    // Valider chaque fichier individuellement
    files.forEach(file => {
        const error = validateFile(file);
        if (error) {
            errors.push(error);
        }
    });

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Schéma Zod pour la validation des données d'upload.
 * @type {z.ZodObject}
 */
export const uploadSchema = z.object({
    files: z.array(z.instanceof(File)).min(1).max(MAX_FILES),
    profile: z.enum(['student', 'professional', 'researcher', 'personal', 'auto']).optional(),
    language: z.enum(['fr', 'en']).default('fr'),
});

export type UploadInput = z.infer<typeof uploadSchema>;

/**
 * Valide les données d'entrée d'un upload avec Zod.
 *
 * @function validateUploadInput
 * @param {unknown} input - Données à valider
 * @returns {Object} Résultat avec success, data ou error
 */
export function validateUploadInput(input: unknown): { success: boolean; data?: UploadInput; error?: string } {
    try {
        const result = uploadSchema.parse(input);
        return { success: true, data: result };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.errors.map(e => e.message).join(', '),
            };
        }
        return {
            success: false,
            error: 'Erreur de validation inconnue',
        };
    }
}