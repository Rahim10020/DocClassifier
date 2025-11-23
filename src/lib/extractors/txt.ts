/**
 * @fileoverview Extracteur de texte pour les fichiers texte brut.
 *
 * Ce module gère l'extraction de contenu des fichiers texte simples
 * (.txt, .md, .rtf) en gérant l'encodage UTF-8.
 *
 * @module extractors/txt
 * @author DocClassifier Team
 */

/**
 * Résultat de l'extraction d'un fichier texte.
 *
 * @interface TXTExtractionResult
 * @property {string} text - Contenu textuel nettoyé
 * @property {number} lineCount - Nombre de lignes
 * @property {number} wordCount - Nombre de mots
 */
export interface TXTExtractionResult {
    text: string;
    lineCount: number;
    wordCount: number;
}

/**
 * Extrait le texte d'un fichier texte brut.
 *
 * Décode le buffer en UTF-8 et calcule les statistiques
 * (nombre de lignes et de mots).
 *
 * @async
 * @function extractTextFromTXT
 * @param {Buffer} buffer - Contenu binaire du fichier
 * @returns {Promise<TXTExtractionResult>} Texte extrait avec statistiques
 * @throws {Error} Si la lecture échoue
 *
 * @example
 * const txtBuffer = await fs.readFile('notes.txt');
 * const result = await extractTextFromTXT(txtBuffer);
 */
export async function extractTextFromTXT(buffer: Buffer): Promise<TXTExtractionResult> {
    try {
        // Détecter l'encodage (UTF-8 par défaut)
        const text = buffer.toString('utf-8');

        const lines = text.split('\n');
        const lineCount = lines.length;
        const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;

        return {
            text: cleanTXTText(text),
            lineCount,
            wordCount,
        };
    } catch (error) {
        console.error('Error extracting TXT:', error);
        throw new Error('Impossible de lire le fichier texte');
    }
}

/**
 * Nettoie le texte d'un fichier texte brut.
 *
 * Opérations :
 * - Normalise les retours à la ligne
 * - Limite les sauts de ligne à 3 maximum
 * - Convertit les tabulations en espaces
 *
 * @function cleanTXTText
 * @param {string} text - Texte brut
 * @returns {string} Texte nettoyé
 */
export function cleanTXTText(text: string): string {
    return text
        .replace(/\r\n/g, '\n')
        .replace(/\n{4,}/g, '\n\n\n')
        .replace(/\t/g, '  ')
        .trim();
}