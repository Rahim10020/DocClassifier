import { Worker } from 'worker_threads';
import { performance } from 'perf_hooks';
import { Document, ProcessingResult, ExtractedText } from '../types';
import path from 'path';

const GLOBAL_TIMEOUT = 3 * 60 * 1000; // 3 minutes
const BATCH_SIZE = 20; // Increased from 5
const MAX_WORKERS = 4;

async function createWorkerPool(size: number): Promise<Worker[]> {
    const workers: Worker[] = [];
    for (let i = 0; i < size; i++) {
        workers.push(new Worker(path.join(__dirname, 'documentWorker.js')));
    }
    return workers;
}

async function processWithWorker(worker: Worker, document: Document): Promise<ExtractedText> {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Document processing timeout'));
        }, 30000);

        worker.once('message', (result) => {
            clearTimeout(timeout);
            resolve(result);
        });

        worker.once('error', reject);
        worker.postMessage(document);
    });
}

async function processDocuments(documents: Document[]): Promise<ProcessingResult> {
    const startTime = performance.now();
    const workers = await createWorkerPool(Math.min(MAX_WORKERS, documents.length));
    const results: ExtractedText[] = [];
    const errors: string[] = [];

    try {
        // Process documents in parallel batches
        for (let i = 0; i < documents.length; i += BATCH_SIZE) {
            const batch = documents.slice(i, i + BATCH_SIZE);
            const batchPromises = batch.map((doc, index) =>
                processWithWorker(workers[index % workers.length], doc)
                    .catch(err => ({
                        id: doc.id,
                        text: '',
                        error: `Failed to process document ${doc.id}: ${err.message}`
                    }))
            );

            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults.filter(r => r.text.trim().length > 0));
            errors.push(...batchResults.filter(r => r.error).map(r => r.error!));

            if (performance.now() - startTime > GLOBAL_TIMEOUT) {
                throw new Error('Global timeout reached');
            }
        }
    } finally {
        workers.forEach(worker => worker.terminate());
    }

    return {
        results,
        processingTime: performance.now() - startTime,
        documentsProcessed: results.length,
        errors: errors.length > 0 ? errors : undefined
    };
}

export { processDocuments };