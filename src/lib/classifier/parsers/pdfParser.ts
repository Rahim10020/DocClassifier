import fs from 'fs/promises';
import pdfParse from 'pdf-parse';

/**
 * Extracts text from a PDF file.
 * @param filepath - The path to the PDF file.
 * @returns A promise that resolves to the extracted text.
 * @throws Error if parsing fails or if the PDF is image-based (returns empty string).
 */
export async function extractTextFromPDF(filepath: string): Promise<string> {
    try {
        const dataBuffer = await fs.readFile(filepath);
        const data = await pdfParse(dataBuffer);

        // If the text length is very small relative to the number of pages, it might be a scanned PDF (image-based)
        if (data.text.length < 100 && data.numpages > 0) {
            console.warn(`PDF at ${filepath} appears to be image-based; returning empty text.`);
            return '';
        }

        return data.text.trim();
    } catch (error) {
        console.error(`Error parsing PDF at ${filepath}:`, error);
        throw new Error('Failed to parse PDF file.');
    }
}