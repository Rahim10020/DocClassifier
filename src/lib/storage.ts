import fs from 'fs-extra';
import path from 'path';
import { nanoid } from 'nanoid';

const TEMP_STORAGE_PATH = process.env.TEMP_STORAGE_PATH || './temp/sessions';

// Valider le sessionId pour éviter les path traversal
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

export async function ensureStorageDirectory(): Promise<void> {
    await fs.ensureDir(TEMP_STORAGE_PATH);
}

export async function createSessionDirectory(sessionId: string): Promise<string> {
    validateSessionId(sessionId);
    const sessionPath = path.join(TEMP_STORAGE_PATH, sessionId);
    await fs.ensureDir(sessionPath);
    return sessionPath;
}

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

export async function deleteSession(sessionId: string): Promise<void> {
    validateSessionId(sessionId);
    const sessionPath = path.join(TEMP_STORAGE_PATH, sessionId);

    if (await fs.pathExists(sessionPath)) {
        await fs.remove(sessionPath);
    }
}

export async function getSessionFiles(sessionId: string): Promise<string[]> {
    validateSessionId(sessionId);
    const sessionPath = path.join(TEMP_STORAGE_PATH, sessionId);

    if (!await fs.pathExists(sessionPath)) {
        return [];
    }

    return await fs.readdir(sessionPath);
}

export async function getFileSize(sessionId: string, fileName: string): Promise<number> {
    validateSessionId(sessionId);
    // Extraire uniquement le nom du fichier de base au cas où un chemin complet serait passé
    const baseFileName = path.basename(fileName);
    const filePath = path.join(TEMP_STORAGE_PATH, sessionId, baseFileName);
    const stats = await fs.stat(filePath);
    return stats.size;
}

export async function fileExists(sessionId: string, fileName: string): Promise<boolean> {
    validateSessionId(sessionId);
    // Extraire uniquement le nom du fichier de base au cas où un chemin complet serait passé
    const baseFileName = path.basename(fileName);
    const filePath = path.join(TEMP_STORAGE_PATH, sessionId, baseFileName);
    return await fs.pathExists(filePath);
}

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

export function getFilePath(sessionId: string, fileName: string): string {
    validateSessionId(sessionId);
    // Extraire uniquement le nom du fichier de base au cas où un chemin complet serait passé
    const baseFileName = path.basename(fileName);
    return path.join(TEMP_STORAGE_PATH, sessionId, baseFileName);
}