import pdfParse from 'pdf-parse';

export interface PDFExtractionResult {
    text: string;
    pageCount: number;
    metadata?: Record<string, unknown>;
}

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

export function cleanPDFText(text: string): string {
    return text
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/\s{2,}/g, ' ')
        .trim();
}