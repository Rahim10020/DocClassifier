import { Document } from '../types';
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

const MAX_TEXT_LENGTH = 1000000; // 1M caractères max

export async function extractText(document: Document): Promise<string> {
    if (!document.content) {
        throw new Error('Empty document content');
    }

    try {
        let text: string;
        switch (document.type.toLowerCase()) {
            case 'pdf':
                text = await extractFromPdf(document.content);
                break;
            case 'docx':
                text = await extractFromDocx(document.content);
                break;
            case 'txt':
                text = Buffer.isBuffer(document.content)
                    ? document.content.toString('utf-8')
                    : document.content;
                break;
            default:
                throw new Error(`Unsupported document type: ${document.type}`);
        }

        // Validate extracted text
        if (!text) {
            throw new Error('No text extracted');
        }

        // Trim excessive content
        text = text.trim();
        if (text.length > MAX_TEXT_LENGTH) {
            text = text.slice(0, MAX_TEXT_LENGTH) + '... (content truncated)';
        }

        return text;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Extraction failed: ${errorMessage}`);
    }
}

async function extractFromPdf(content: Buffer | string): Promise<string> {
    if (typeof content === 'string') {
        throw new Error('PDF content must be a Buffer');
    }

    try {
        const data = await pdf(content);
        return data.text || '';
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (errorMessage.includes('Memory limit')) {
            throw new Error('PDF file too large to process');
        }
        throw new Error(`PDF extraction failed: ${errorMessage}`);
    }
}

async function extractFromDocx(content: Buffer | string): Promise<string> {
    if (typeof content === 'string') {
        throw new Error('DOCX content must be a Buffer');
    }

    try {
        const result = await mammoth.extractRawText({
            buffer: content
        });
        return result.value || '';
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`DOCX extraction failed: ${errorMessage}`);
    }
}
