import { extractText } from './textExtractor';
import pLimit from 'p-limit';

/**
 * Extrait le texte de plusieurs fichiers en parallèle avec limite de concurrence
 */
export async function extractTextsInParallel(
    files: Array<{ path: string; mimeType: string; id: string }>,
    concurrencyLimit: number = 10
): Promise<Array<{ id: string; text: string; success: boolean; error?: string }>> {
    const limit = pLimit(concurrencyLimit);
    
    const tasks = files.map(file => 
        limit(async () => {
            try {
                const text = await extractText(file.path, file.mimeType);
                return { id: file.id, text, success: true };
            } catch (error) {
                console.error(\`Extraction failed for \${file.id}:\`, error);
                return { 
                    id: file.id, 
                    text: '', 
                    success: false, 
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
            }
        })
    );
    
    return Promise.all(tasks);
}
