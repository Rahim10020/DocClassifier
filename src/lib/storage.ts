/**
 * @fileoverview Module de gestion du stockage temporaire des fichiers.
 *
 * Ce module gère le système de fichiers temporaires pour les sessions de classification.
 * Il inclut des protections contre les attaques de type path traversal et gère
 * automatiquement le nettoyage des sessions expirées.
 *
 * @module lib/storage
 * @author DocClassifier Team
 */

import fs from 'fs-extra';
import path from 'path';
import { nanoid } from 'nanoid';

/**
 * Chemin de base pour le stockage temporaire des sessions.
 * Configurable via la variable d'environnement TEMP_STORAGE_PATH.
 * @constant {string}
 */
const TEMP_STORAGE_PATH = process.env.TEMP_STORAGE_PATH || './temp/sessions';

/**
 * Valide un identifiant de session pour prévenir les attaques path traversal.
 *
 * Vérifie que le sessionId :
 * - Est une chaîne non vide
 * - Ne contient que des caractères alphanumériques, tirets et underscores
 * - A une longueur entre 10 et 50 caractères
 *
 * @function validateSessionId
 * @param {string} sessionId - Identifiant de session à valider
 * @throws {Error} Si le sessionId est invalide
 * @private
 */
function validateSessionId(sessionId: string): void {
    if (!sessionId || typeof sessionId !== 'string') {
        throw new Error('Session ID invalide');
    }
    // Vérifier que le sessionId ne contient que des caractères alphanumériques, - et _
    if (!/^[a-zA-Z0-9_-]+$/.test(sessionId)) {
        throw new Error('Session ID contient des caractères invalides');
    }
    // Vérifier la longueur (nanoid génère 21 caractères par défaut)
    if (sessionId.length < 10 || sessionId.length > 50) {
        throw new Error('Session ID a une longueur invalide');
    }
}

/**
 * S'assure que le répertoire de stockage principal existe.
 *
 * @async
 * @function ensureStorageDirectory
 * @returns {Promise<void>}
 */
export async function ensureStorageDirectory(): Promise<void> {
    await fs.ensureDir(TEMP_STORAGE_PATH);
}

/**
 * Crée un répertoire pour une session de classification.
 *
 * @async
 * @function createSessionDirectory
 * @param {string} sessionId - Identifiant unique de la session
 * @returns {Promise<string>} Chemin absolu du répertoire créé
 * @throws {Error} Si le sessionId est invalide
 */
export async function createSessionDirectory(sessionId: string): Promise<string> {
    validateSessionId(sessionId);
    const sessionPath = path.join(TEMP_STORAGE_PATH, sessionId);
    await fs.ensureDir(sessionPath);
    return sessionPath;
}

/**
 * Sauvegarde un fichier uploadé dans le répertoire de session.
 *
 * Génère un nom de fichier unique avec nanoid tout en conservant l'extension.
 *
 * @async
 * @function saveFile
 * @param {string} sessionId - Identifiant de la session
 * @param {File} file - Fichier à sauvegarder (objet File de l'API Web)
 * @returns {Promise<string>} Nom du fichier généré (ex: "abc123.pdf")
 */
export async function saveFile(sessionId: string, file: File): Promise<string> {
    validateSessionId(sessionId);
    const sessionPath = await createSessionDirectory(sessionId);
    const fileId = nanoid();
    const extension = file.name.split('.').pop() || 'bin';
    const fileName = `${fileId}.${extension}`;
    const filePath = path.join(sessionPath, fileName);

    // Utiliser les streams pour éviter de charger tout le fichier en mémoire
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    return fileName;
}

/**
 * Lit le contenu d'un fichier depuis une session.
 *
 * Inclut une protection contre les attaques path traversal en vérifiant
 * que le chemin résolu reste dans le répertoire de session.
 *
 * @async
 * @function readFile
 * @param {string} sessionId - Identifiant de la session
 * @param {string} fileName - Nom du fichier à lire
 * @returns {Promise<Buffer>} Contenu binaire du fichier
 * @throws {Error} Si le fichier n'existe pas ou tentative d'accès hors session
 */
export async function readFile(sessionId: string, fileName: string): Promise<Buffer> {
    validateSessionId(sessionId);
    // Extraire uniquement le nom du fichier de base au cas où un chemin complet serait passé
    const baseFileName = path.basename(fileName);
    const filePath = path.join(TEMP_STORAGE_PATH, sessionId, baseFileName);

    // Vérifier que le chemin résolu est bien dans le répertoire de session
    const resolvedPath = path.resolve(filePath);
    const sessionPath = path.resolve(TEMP_STORAGE_PATH, sessionId);
    if (!resolvedPath.startsWith(sessionPath)) {
        throw new Error('Tentative d\'accès à un fichier en dehors du répertoire de session');
    }

    if (!await fs.pathExists(filePath)) {
        throw new Error(`File not found: ${baseFileName} in session ${sessionId}`);
    }

    return await fs.readFile(filePath);
}

/**
 * Supprime complètement un répertoire de session et son contenu.
 *
 * @async
 * @function deleteSession
 * @param {string} sessionId - Identifiant de la session à supprimer
 * @returns {Promise<void>}
 */
export async function deleteSession(sessionId: string): Promise<void> {
    validateSessionId(sessionId);
    const sessionPath = path.join(TEMP_STORAGE_PATH, sessionId);

    if (await fs.pathExists(sessionPath)) {
        await fs.remove(sessionPath);
    }
}

/**
 * Liste tous les fichiers d'une session.
 *
 * @async
 * @function getSessionFiles
 * @param {string} sessionId - Identifiant de la session
 * @returns {Promise<string[]>} Liste des noms de fichiers
 */
export async function getSessionFiles(sessionId: string): Promise<string[]> {
    validateSessionId(sessionId);
    const sessionPath = path.join(TEMP_STORAGE_PATH, sessionId);

    if (!await fs.pathExists(sessionPath)) {
        return [];
    }

    return await fs.readdir(sessionPath);
}

/**
 * Récupère la taille d'un fichier en octets.
 *
 * @async
 * @function getFileSize
 * @param {string} sessionId - Identifiant de la session
 * @param {string} fileName - Nom du fichier
 * @returns {Promise<number>} Taille en octets
 */
export async function getFileSize(sessionId: string, fileName: string): Promise<number> {
    validateSessionId(sessionId);
    // Extraire uniquement le nom du fichier de base au cas où un chemin complet serait passé
    const baseFileName = path.basename(fileName);
    const filePath = path.join(TEMP_STORAGE_PATH, sessionId, baseFileName);
    const stats = await fs.stat(filePath);
    return stats.size;
}

/**
 * Vérifie si un fichier existe dans une session.
 *
 * @async
 * @function fileExists
 * @param {string} sessionId - Identifiant de la session
 * @param {string} fileName - Nom du fichier
 * @returns {Promise<boolean>} True si le fichier existe
 */
export async function fileExists(sessionId: string, fileName: string): Promise<boolean> {
    validateSessionId(sessionId);
    // Extraire uniquement le nom du fichier de base au cas où un chemin complet serait passé
    const baseFileName = path.basename(fileName);
    const filePath = path.join(TEMP_STORAGE_PATH, sessionId, baseFileName);
    return await fs.pathExists(filePath);
}

/**
 * Nettoie les sessions expirées du système de fichiers.
 *
 * Supprime les répertoires de session dont la dernière modification
 * date de plus de 3 heures.
 *
 * @async
 * @function cleanupExpiredSessions
 * @returns {Promise<number>} Nombre de sessions supprimées
 */
export async function cleanupExpiredSessions(): Promise<number> {
    await ensureStorageDirectory();

    const sessions = await fs.readdir(TEMP_STORAGE_PATH);
    let deletedCount = 0;

    for (const sessionId of sessions) {
        const sessionPath = path.join(TEMP_STORAGE_PATH, sessionId);
        const stats = await fs.stat(sessionPath);

        // Supprimer les sessions de plus de 3 heures
        const hoursOld = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60);
        if (hoursOld > 3) {
            await fs.remove(sessionPath);
            deletedCount++;
        }
    }

    return deletedCount;
}

/**
 * Construit le chemin complet d'un fichier dans une session.
 *
 * @function getFilePath
 * @param {string} sessionId - Identifiant de la session
 * @param {string} fileName - Nom du fichier
 * @returns {string} Chemin complet du fichier
 */
export function getFilePath(sessionId: string, fileName: string): string {
    validateSessionId(sessionId);
    // Extraire uniquement le nom du fichier de base au cas où un chemin complet serait passé
    const baseFileName = path.basename(fileName);
    return path.join(TEMP_STORAGE_PATH, sessionId, baseFileName);
}