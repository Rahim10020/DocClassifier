import * as XLSX from 'xlsx';

export interface XLSXExtractionResult {
    text: string;
    sheetCount: number;
    rowCount: number;
}

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

export function cleanXLSXText(text: string): string {
    return text
        .replace(/,{2,}/g, ',')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}