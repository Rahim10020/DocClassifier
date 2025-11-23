/**
 * @fileoverview Fonctions utilitaires générales pour l'application.
 *
 * Ce module contient des fonctions helper réutilisables pour :
 * - Manipulation de classes CSS (Tailwind)
 * - Formatage de dates et tailles de fichiers
 * - Gestion des sessions et identifiants
 * - Utilitaires JavaScript généraux (debounce, groupBy, etc.)
 *
 * @module lib/utils
 * @author DocClassifier Team
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine et fusionne des classes CSS avec support Tailwind.
 *
 * Utilise clsx pour la combinaison conditionnelle et tailwind-merge
 * pour résoudre les conflits de classes Tailwind.
 *
 * @function cn
 * @param {...ClassValue} inputs - Classes CSS à combiner
 * @returns {string} Chaîne de classes fusionnées
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-blue-500', 'hover:bg-blue-600')
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Formate une taille de fichier en format lisible (B, KB, MB, GB).
 *
 * @function formatFileSize
 * @param {number} bytes - Taille en octets
 * @returns {string} Taille formatée (ex: "1.5 MB")
 *
 * @example
 * formatFileSize(1536); // "1.5 KB"
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Formate une date en format français complet.
 *
 * @function formatDate
 * @param {Date | string} date - Date à formater
 * @returns {string} Date formatée (ex: "15 janvier 2024, 14:30")
 */
export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(d);
}

/**
 * Formate une date en temps relatif (il y a X min/h/j).
 *
 * @function formatRelativeTime
 * @param {Date | string} date - Date à formater
 * @returns {string} Temps relatif (ex: "Il y a 5 min")
 */
export function formatRelativeTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - d.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;

    return formatDate(d);
}

/**
 * Extrait l'extension d'un nom de fichier.
 *
 * @function getFileExtension
 * @param {string} filename - Nom du fichier
 * @returns {string} Extension en minuscules (ex: "pdf")
 */
export function getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Retourne l'emoji approprié pour un type de fichier.
 *
 * @function getFileIcon
 * @param {string} fileType - Extension du fichier
 * @returns {string} Emoji représentant le type
 */
export function getFileIcon(fileType: string): string {
    const icons: Record<string, string> = {
        pdf: '📄',
        doc: '📝',
        docx: '📝',
        txt: '📃',
        md: '📋',
        rtf: '📝',
        xlsx: '📊',
        xls: '📊',
        csv: '📊',
        odt: '📝',
        ods: '📊',
    };

    return icons[fileType] || '📎';
}

/**
 * Tronque un texte à une longueur maximale avec ellipsis.
 *
 * @function truncateText
 * @param {string} text - Texte à tronquer
 * @param {number} maxLength - Longueur maximale
 * @returns {string} Texte tronqué
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Nettoie un nom de fichier en remplaçant les caractères spéciaux.
 *
 * @function sanitizeFilename
 * @param {string} filename - Nom de fichier à nettoyer
 * @returns {string} Nom de fichier sécurisé
 */
export function sanitizeFilename(filename: string): string {
    return filename
        .replace(/[^a-z0-9.-]/gi, '_')
        .replace(/_{2,}/g, '_')
        .toLowerCase();
}

/**
 * Calcule la couleur CSS pour un niveau de confiance.
 *
 * @function calculateConfidenceColor
 * @param {number} confidence - Score de confiance (0-1)
 * @returns {string} Variable CSS de couleur (success/warning/error)
 */
export function calculateConfidenceColor(confidence: number): string {
    if (confidence >= 0.8) return 'var(--success)';
    if (confidence >= 0.6) return 'var(--warning)';
    return 'var(--error)';
}

/**
 * Retourne un libellé pour un niveau de confiance.
 *
 * @function calculateConfidenceLabel
 * @param {number} confidence - Score de confiance (0-1)
 * @returns {string} Libellé (Haute/Moyenne/Faible)
 */
export function calculateConfidenceLabel(confidence: number): string {
    if (confidence >= 0.8) return 'Haute';
    if (confidence >= 0.6) return 'Moyenne';
    return 'Faible';
}

/**
 * Génère un identifiant de session unique.
 *
 * @function generateSessionId
 * @returns {string} ID de session (ex: "sess_1234567890_abc123")
 */
export function generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Vérifie si une session est expirée.
 *
 * @function isSessionExpired
 * @param {Date | string} expiresAt - Date d'expiration
 * @returns {boolean} True si expirée
 */
export function isSessionExpired(expiresAt: Date | string): boolean {
    const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
    return expiry.getTime() < Date.now();
}

/**
 * Calcule la date d'expiration d'une session.
 *
 * @function calculateSessionExpiry
 * @param {number} [hours=2] - Durée en heures
 * @returns {Date} Date d'expiration
 */
export function calculateSessionExpiry(hours: number = 2): Date {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + hours);
    return expiry;
}

/**
 * Pause l'exécution pendant un délai donné.
 *
 * @function sleep
 * @param {number} ms - Délai en millisecondes
 * @returns {Promise<void>}
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Crée une version débounced d'une fonction.
 *
 * @function debounce
 * @param {Function} func - Fonction à débouncer
 * @param {number} wait - Délai d'attente en ms
 * @returns {Function} Fonction débounced
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Groupe un tableau d'objets par une clé.
 *
 * @function groupBy
 * @param {T[]} array - Tableau à grouper
 * @param {keyof T} key - Clé de groupement
 * @returns {Record<string, T[]>} Objet groupé
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((result, item) => {
        const group = String(item[key]);
        if (!result[group]) {
            result[group] = [];
        }
        result[group].push(item);
        return result;
    }, {} as Record<string, T[]>);
}

/**
 * Sérialise les BigInt en strings pour la conversion JSON.
 *
 * @function serializeBigInt
 * @param {any} obj - Objet à sérialiser
 * @returns {any} Objet avec BigInt convertis en strings
 */
export function serializeBigInt(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return obj.toString();
    if (Array.isArray(obj)) return obj.map(serializeBigInt);
    if (typeof obj === 'object') {
        const result: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                result[key] = serializeBigInt(obj[key]);
            }
        }
        return result;
    }
    return obj;
}