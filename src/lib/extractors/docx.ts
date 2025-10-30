import mammoth from 'mammoth';

export interface DOCXExtractionResult {
    text: string;
    wordCount: number;
}

export async function extractTextFromDOCX(buffer: Buffer): Promise<DOCXExtractionResult> {
    try {
        const result = await mammoth.extractRawText({ buffer });
        const text = result.value;
        const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;

        return {
            text,
            wordCount,
        };
    } catch (error) {
        console.error('Error extracting DOCX:', error);
        throw new Error('Impossible d\'extraire le texte du document Word');
    }
}

export function cleanDOCXText(text: string): string {
    return text
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/\s{2,}/g, ' ')
        .trim();
}