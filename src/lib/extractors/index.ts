import { extractTextFromPDF } from './pdf';
import { extractTextFromDOCX } from './docx';
import { extractTextFromXLSX } from './xlsx';
import { extractTextFromTXT } from './txt';

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