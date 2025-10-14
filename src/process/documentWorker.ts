import { parentPort, workerData } from 'worker_threads';
import { Document, ExtractedText } from '../types';
import { extractText } from './textExtractor';

const PROCESS_TIMEOUT = 30000; // 30 seconds timeout

async function processDocument(document: Document): Promise<ExtractedText> {
    // Validate input
    if (!document || !document.id || !document.content) {
        throw new Error('Invalid document format');
    }

    // Process with timeout
    return Promise.race([
        extractTextWithValidation(document),
        new Promise<ExtractedText>((_, reject) =>
            setTimeout(() => reject(new Error('Processing timeout')), PROCESS_TIMEOUT)
        )
    ]);
}

async function extractTextWithValidation(document: Document): Promise<ExtractedText> {
    try {
        // Check document size
        const contentSize = Buffer.isBuffer(document.content)
            ? document.content.length
            : Buffer.from(document.content).length;

        if (contentSize > 50 * 1024 * 1024) { // 50MB limit
            throw new Error('Document too large');
        }

        const text = await extractText(document);
        if (!text || text.trim().length === 0) {
            throw new Error('No text content extracted');
        }

        return {
            id: document.id,
            text,
            metadata: {
                size: contentSize,
                type: document.type
            }
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error during extraction';
        return {
            id: document.id,
            text: '',
            error: errorMessage,
            metadata: {
                failedAt: new Date().toISOString()
            }
        };
    }
}

// Worker message handling with error recovery
if (parentPort) {
    let activeProcessing = false;
    let errorCount = 0;
    const MAX_ERRORS = 5;
    const RESET_ERROR_INTERVAL = 60000; // 1 minute

    setInterval(() => {
        errorCount = 0;
    }, RESET_ERROR_INTERVAL);

    parentPort.on('message', async (document: Document) => {
        if (activeProcessing) {
            parentPort?.postMessage({
                id: document.id,
                text: '',
                error: 'Worker busy',
                metadata: { failedAt: new Date().toISOString() }
            });
            return;
        }

        if (errorCount >= MAX_ERRORS) {
            process.exit(1); // Force worker restart
        }

        activeProcessing = true;
        try {
            const result = await processDocument(document);
            parentPort?.postMessage(result);
        } catch (error) {
            errorCount++;
            const errorMessage = error instanceof Error ? error.message : 'Processing failed';
            parentPort?.postMessage({
                id: document.id,
                text: '',
                error: errorMessage,
                metadata: {
                    failedAt: new Date().toISOString(),
                    errorCount
                }
            });
        } finally {
            activeProcessing = false;
        }
    });

    // More robust error handling
    const errorHandler = (error: Error) => {
        console.error('Worker error:', error);
        errorCount++;
        if (errorCount >= MAX_ERRORS) {
            process.exit(1);
        }
    };

    process.on('uncaughtException', errorHandler);
    process.on('unhandledRejection', errorHandler);

    // Signal ready
    parentPort.postMessage({ type: 'ready' });
}
