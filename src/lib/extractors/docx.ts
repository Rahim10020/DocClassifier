/**
 * @fileoverview Extracteur de texte pour les fichiers Word (DOCX).
 *
 * Ce module utilise la bibliothèque mammoth pour extraire le contenu
 * textuel des documents Microsoft Word (.docx).
 *
 * @module extractors/docx
 * @author DocClassifier Team
 */

import mammoth from 'mammoth';

/**
 * Résultat de l'extraction d'un fichier DOCX.
 *
 * @interface DOCXExtractionResult
 * @property {string} text - Contenu textuel extrait
 * @property {number} wordCount - Nombre de mots dans le document
 */
export interface DOCXExtractionResult {
    text: string;
    wordCount: number;
}

/**
 * Extrait le texte d'un fichier Word (DOCX).
 *
 * Utilise mammoth pour extraire le texte brut en ignorant la mise en forme.
 * Calcule également le nombre de mots pour les statistiques.
 *
 * @async
 * @function extractTextFromDOCX
 * @param {Buffer} buffer - Contenu binaire du fichier DOCX
 * @returns {Promise<DOCXExtractionResult>} Texte extrait avec comptage
 * @throws {Error} Si l'extraction échoue
 *
 * @example
 * const docxBuffer = await fs.readFile('document.docx');
 * const result = await extractTextFromDOCX(docxBuffer);
 * console.log(`${result.wordCount} mots extraits`);
 */
export async function extractTextFromDOCX(buffer: Buffer): Promise<DOCXExtractionResult> {
    try {
        const result = await mammoth.extractRawText({ buffer });
        const text = result.value;
        const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;

        return {
            text,
            wordCount,
        };
    } catch (error) {
        console.error('Error extracting DOCX:', error);
        throw new Error('Impossible d\'extraire le texte du document Word');
    }
}

/**
 * Nettoie le texte extrait d'un document Word.
 *
 * @function cleanDOCXText
 * @param {string} text - Texte brut extrait
 * @returns {string} Texte nettoyé
 */
export function cleanDOCXText(text: string): string {
    return text
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/\s{2,}/g, ' ')
        .trim();
}