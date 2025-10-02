import fs from 'fs/promises';

/**
 * Extracts text from a TXT file.
 * @param filepath - The path to the TXT file.
 * @returns A promise that resolves to the extracted text.
 * @throws Error if reading fails.
 */
export async function extractTextFromTxt(filepath: string): Promise<string> {
    try {
        const text = await fs.readFile(filepath, 'utf-8');
        return text.trim();
    } catch (error) {
        console.error(`Error reading TXT at ${filepath}:`, error);
        throw new Error('Failed to read TXT file.');
    }
}