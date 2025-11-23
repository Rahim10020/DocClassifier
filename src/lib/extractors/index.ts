/**
 * @fileoverview Point d'entrée principal pour l'extraction de texte.
 *
 * Ce module fournit une fonction unifiée pour extraire le texte de différents
 * types de fichiers (PDF, DOCX, XLSX, TXT, etc.) en routant vers l'extracteur
 * approprié selon l'extension du fichier.
 *
 * Types supportés :
 * - PDF : Documents PDF (avec pdf-parse)
 * - DOCX/DOC : Documents Word (avec mammoth)
 * - XLSX/XLS/CSV : Feuilles de calcul (avec xlsx)
 * - TXT/MD/RTF : Fichiers texte brut
 * - ODT/ODS : OpenDocument (traités comme texte brut)
 *
 * @module extractors
 * @author DocClassifier Team
 */

import { extractTextFromPDF } from './pdf';
import { extractTextFromDOCX } from './docx';
import { extractTextFromXLSX } from './xlsx';
import { extractTextFromTXT } from './txt';

/**
 * Extrait le texte d'un fichier selon son type.
 *
 * Fonction principale qui route vers l'extracteur approprié
 * en fonction de l'extension du fichier.
 *
 * @async
 * @function extractText
 * @param {Buffer} buffer - Contenu binaire du fichier
 * @param {string} fileType - Extension du fichier (pdf, docx, xlsx, etc.)
 * @returns {Promise<Object>} Résultat d'extraction
 * @returns {string} returns.text - Contenu textuel extrait
 * @returns {number} [returns.pageCount] - Nombre de pages (PDF/Excel)
 * @returns {number} [returns.wordCount] - Nombre de mots/lignes
 * @throws {Error} Si le type de fichier n'est pas supporté
 *
 * @example
 * const buffer = await fs.readFile('document.pdf');
 * const result = await extractText(buffer, 'pdf');
 * console.log(result.text);
 */
export async function extractText(
    buffer: Buffer,
    fileType: string
): Promise<{ text: string; pageCount?: number; wordCount?: number }> {
    switch (fileType.toLowerCase()) {
        case 'pdf':
            const pdfResult = await extractTextFromPDF(buffer);
            return {
                text: pdfResult.text,
                pageCount: pdfResult.pageCount,
            };

        case 'docx':
        case 'doc':
            const docxResult = await extractTextFromDOCX(buffer);
            return {
                text: docxResult.text,
                wordCount: docxResult.wordCount,
            };

        case 'xlsx':
        case 'xls':
        case 'csv':
            const xlsxResult = await extractTextFromXLSX(buffer);
            return {
                text: xlsxResult.text,
                pageCount: xlsxResult.sheetCount,
                wordCount: xlsxResult.rowCount,
            };

        case 'txt':
        case 'md':
        case 'rtf':
            const txtResult = await extractTextFromTXT(buffer);
            return {
                text: txtResult.text,
                wordCount: txtResult.wordCount,
            };

        case 'odt':
        case 'ods':
            // Pour l'instant, traiter comme du texte brut
            const odtResult = await extractTextFromTXT(buffer);
            return {
                text: odtResult.text,
                wordCount: odtResult.wordCount,
            };

        default:
            throw new Error(`Type de fichier non supporté: ${fileType}`);
    }
}

export * from './pdf';
export * from './docx';
export * from './xlsx';
export * from './txt';