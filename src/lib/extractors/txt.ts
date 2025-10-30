export interface TXTExtractionResult {
    text: string;
    lineCount: number;
    wordCount: number;
}

export async function extractTextFromTXT(buffer: Buffer): Promise<TXTExtractionResult> {
    try {
        // Détecter l'encodage (UTF-8 par défaut)
        const text = buffer.toString('utf-8');

        const lines = text.split('\n');
        const lineCount = lines.length;
        const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;

        return {
            text: cleanTXTText(text),
            lineCount,
            wordCount,
        };
    } catch (error) {
        console.error('Error extracting TXT:', error);
        throw new Error('Impossible de lire le fichier texte');
    }
}

export function cleanTXTText(text: string): string {
    return text
        .replace(/\r\n/g, '\n')
        .replace(/\n{4,}/g, '\n\n\n')
        .replace(/\t/g, '  ')
        .trim();
}