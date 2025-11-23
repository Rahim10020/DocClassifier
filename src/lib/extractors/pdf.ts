/**
 * @fileoverview Extracteur de texte pour les fichiers PDF.
 *
 * Ce module utilise la bibliothèque pdf-parse pour extraire le contenu
 * textuel des documents PDF. Il gère également les métadonnées du document.
 *
 * @module extractors/pdf
 * @author DocClassifier Team
 */

import pdfParse from 'pdf-parse';

/**
 * Résultat de l'extraction d'un fichier PDF.
 *
 * @interface PDFExtractionResult
 * @property {string} text - Contenu textuel extrait du PDF
 * @property {number} pageCount - Nombre de pages du document
 * @property {Record<string, unknown>} [metadata] - Métadonnées du PDF (titre, auteur, etc.)
 */
export interface PDFExtractionResult {
    text: string;
    pageCount: number;
    metadata?: Record<string, unknown>;
}

/**
 * Extrait le texte d'un fichier PDF.
 *
 * Note : Les PDF scannés (images) retourneront un texte vide car
 * cette fonction n'inclut pas d'OCR.
 *
 * @async
 * @function extractTextFromPDF
 * @param {Buffer} buffer - Contenu binaire du fichier PDF
 * @returns {Promise<PDFExtractionResult>} Texte extrait avec métadonnées
 * @throws {Error} Si l'extraction échoue
 *
 * @example
 * const pdfBuffer = await fs.readFile('document.pdf');
 * const result = await extractTextFromPDF(pdfBuffer);
 * console.log(result.text);
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<PDFExtractionResult> {
    try {
        const data = await pdfParse(buffer);

        return {
            text: data.text,
            pageCount: data.numpages,
            metadata: data.info,
        };
    } catch (error) {
        console.error('Error extracting PDF:', error);
        throw new Error('Impossible d\'extraire le texte du PDF');
    }
}

/**
 * Nettoie le texte extrait d'un PDF.
 *
 * Opérations de nettoyage :
 * - Normalise les retours à la ligne (CRLF → LF)
 * - Réduit les sauts de ligne multiples à 2 maximum
 * - Réduit les espaces multiples à 1
 *
 * @function cleanPDFText
 * @param {string} text - Texte brut extrait du PDF
 * @returns {string} Texte nettoyé
 */
export function cleanPDFText(text: string): string {
    return text
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/\s{2,}/g, ' ')
        .trim();
}