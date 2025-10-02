// src/lib/classifier/textExtractor.ts

import fs from 'fs/promises';
import path from 'path';
import { extractTextFromPDF } from './parsers/pdfParser';
import { extractTextFromDocx } from './parsers/docxParser';
import { extractTextFromTxt } from './parsers/txtParser';
import { extractTextFromXlsx } from './parsers/xlsxParser';

/**
 * Extracts text from a file based on its MIME type.
 * @param filepath - The path to the file.
 * @param mimeType - The MIME type of the file.
 * @returns A promise that resolves to the extracted text.
 * @throws Error if the MIME type is unsupported or extraction fails.
 */
export async function extractText(filepath: string, mimeType: string): Promise<string> {
    try {
        const ext = path.extname(filepath).toLowerCase();

        switch (mimeType) {
            case 'application/pdf':
                if (ext !== '.pdf') throw new Error('File extension does not match MIME type');
                return await extractTextFromPDF(filepath);

            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                if (ext !== '.docx') throw new Error('File extension does not match MIME type');
                return await extractTextFromDocx(filepath);

            case 'text/plain':
                if (ext !== '.txt') throw new Error('File extension does not match MIME type');
                return await extractTextFromTxt(filepath);

            case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                if (ext !== '.xlsx') throw new Error('File extension does not match MIME type');
                return await extractTextFromXlsx(filepath);

            default:
                throw new Error(`Unsupported MIME type: ${mimeType}`);
        }
    } catch (error) {
        console.error(`Error extracting text from ${filepath}:`, error);
        throw new Error('Text extraction failed. Please check the file format and try again.');
    }
}