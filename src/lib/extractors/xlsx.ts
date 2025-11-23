/**
 * @fileoverview Extracteur de texte pour les fichiers Excel (XLSX/XLS/CSV).
 *
 * Ce module utilise la bibliothèque SheetJS (xlsx) pour extraire le contenu
 * textuel des feuilles de calcul Excel et fichiers CSV.
 *
 * @module extractors/xlsx
 * @author DocClassifier Team
 */

import * as XLSX from 'xlsx';

/**
 * Résultat de l'extraction d'un fichier Excel.
 *
 * @interface XLSXExtractionResult
 * @property {string} text - Contenu textuel extrait (format CSV)
 * @property {number} sheetCount - Nombre de feuilles dans le classeur
 * @property {number} rowCount - Nombre total de lignes avec contenu
 */
export interface XLSXExtractionResult {
    text: string;
    sheetCount: number;
    rowCount: number;
}

/**
 * Extrait le texte d'un fichier Excel (XLSX/XLS) ou CSV.
 *
 * Parcourt toutes les feuilles du classeur et convertit leur contenu
 * en format CSV. Chaque feuille est précédée d'un séparateur avec son nom.
 *
 * @async
 * @function extractTextFromXLSX
 * @param {Buffer} buffer - Contenu binaire du fichier
 * @returns {Promise<XLSXExtractionResult>} Texte extrait avec statistiques
 * @throws {Error} Si l'extraction échoue
 *
 * @example
 * const xlsxBuffer = await fs.readFile('data.xlsx');
 * const result = await extractTextFromXLSX(xlsxBuffer);
 * console.log(`${result.sheetCount} feuilles, ${result.rowCount} lignes`);
 */
export async function extractTextFromXLSX(buffer: Buffer): Promise<XLSXExtractionResult> {
    try {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetCount = workbook.SheetNames.length;
        let allText = '';
        let totalRows = 0;

        // Extraire le texte de chaque feuille
        for (const sheetName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sheetName];
            const csvText = XLSX.utils.sheet_to_csv(sheet);
            allText += `\n--- ${sheetName} ---\n${csvText}\n`;

            // Compter les lignes
            const rows = csvText.split('\n').filter(row => row.trim().length > 0);
            totalRows += rows.length;
        }

        return {
            text: allText.trim(),
            sheetCount,
            rowCount: totalRows,
        };
    } catch (error) {
        console.error('Error extracting XLSX:', error);
        throw new Error('Impossible d\'extraire le texte du fichier Excel');
    }
}

/**
 * Nettoie le texte extrait d'un fichier Excel.
 *
 * Opérations :
 * - Réduit les virgules consécutives (cellules vides)
 * - Réduit les sauts de ligne multiples
 *
 * @function cleanXLSXText
 * @param {string} text - Texte brut au format CSV
 * @returns {string} Texte nettoyé
 */
export function cleanXLSXText(text: string): string {
    return text
        .replace(/,{2,}/g, ',')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}