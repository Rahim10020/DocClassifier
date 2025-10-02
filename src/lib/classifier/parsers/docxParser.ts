import fs from 'fs/promises';
import mammoth from 'mammoth';

/**
 * Extracts text from a DOCX file.
 * @param filepath - The path to the DOCX file.
 * @returns A promise that resolves to the extracted text.
 * @throws Error if parsing fails.
 */
export async function extractTextFromDocx(filepath: string): Promise<string> {
    try {
        const buffer = await fs.readFile(filepath);
        const result = await mammoth.extractRawText({ buffer });

        return result.value.trim();
    } catch (error) {
        console.error(`Error parsing DOCX at ${filepath}:`, error);
        throw new Error('Failed to parse DOCX file.');
    }
}