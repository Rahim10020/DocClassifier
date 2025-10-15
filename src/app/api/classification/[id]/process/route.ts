import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import prisma from '@/lib/db/prisma';
import { extractText } from '@/lib/classifier/textExtractor';
import { classifyDocuments } from '@/lib/classifier/categorizer';
import { getClassificationById, updateClassification } from '@/lib/db/queries/classifications';
import { TempStorage } from '@/lib/storage/tempStorage';
import path from 'path';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    // Timeout global porté à 15 minutes
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Processing timeout after 15 minutes')), 15 * 60 * 1000);
    });

    try {
        const jobSecretHeader = req.headers.get('x-job-secret');
        const expectedSecret = process.env.JOB_SECRET;
        const isJobRequest = Boolean(expectedSecret && jobSecretHeader && jobSecretHeader === expectedSecret);

        // Allow either a background job with secret or an authenticated user
        let userId: string | null = null;
        if (!isJobRequest) {
            const session = await getServerSession(authOptions);
            if (!session?.user?.id) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            userId = session.user.id;
        }

        const classificationId = params.id;
        const classification = await getClassificationById(classificationId);
        if (!classification) {
            return NextResponse.json({ error: 'Classification not found' }, { status: 404 });
        }
        if (!isJobRequest && userId && classification.userId !== userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Course entre traitement et timeout
        await Promise.race([
            performClassificationProcess(classificationId),
            timeoutPromise
        ]);

        return NextResponse.json({ success: true, message: 'Classification completed successfully' });
    } catch (error) {
        console.error('Error processing classification:', error);

        // Mise à jour du statut si échec pour arrêter le polling
        try {
            const classificationId = params.id;
            await updateClassification(classificationId, {
                status: 'READY' // Mark as ready so polling stops, even though processing failed
            });
        } catch (updateError) {
            console.error('Error updating classification status:', updateError instanceof Error ? updateError.message : String(updateError));
        }

        if (error instanceof Error && error.message.includes('timeout')) {
            return NextResponse.json({
                error: 'Délai dépassé: le traitement de classification a été trop long',
                code: 'TIMEOUT'
            }, { status: 408 });
        }

        return NextResponse.json({ error: 'Erreur interne lors du traitement de la classification' }, { status: 500 });
    }
}

// Extract the main processing logic into a separate function for better error handling
async function performClassificationProcess(classificationId: string) {
    // Fetch documents from database
    const documents = await prisma.documentMetadata.findMany({ where: { classificationId } });

    if (documents.length === 0) {
        throw new Error('No documents found for classification');
    }

    // Create temp storage instance to access files
    const classificationData = await getClassificationById(classificationId);
    if (!classificationData?.sessionId) {
        throw new Error('Session ID not found for classification');
    }

    const storage = new TempStorage(classificationData.sessionId);

    // Extraction de texte en parallèle avec batchs, logs détaillés
    const totalDocuments = documents.length;
    const BATCH_SIZE = 5; // Process 5 documents in parallel
    let processedDocuments = 0;
    const typeCounters = new Map<string, number>();

    // Process documents in batches for better performance
    for (let i = 0; i < documents.length; i += BATCH_SIZE) {
        const batch = documents.slice(i, i + BATCH_SIZE);

        // Process batch in parallel
        const batchPromises = batch.map(async (doc) => {
            const filePath = path.join(storage.getBasePath(), doc.filename);

            try {
                const text = await extractText(filePath, doc.mimeType);
                await prisma.documentMetadata.update({
                    where: { id: doc.id },
                    data: { extractedText: text },
                });
                // Compter types
                typeCounters.set(doc.mimeType, (typeCounters.get(doc.mimeType) || 0) + 1);
                // Log échantillon 100 chars
                const sample = (text || '').slice(0, 100).replace(/\s+/g, ' ');
                console.log('[process] Extraction OK', { id: doc.id, name: doc.originalName, type: doc.mimeType, sample });
                return { success: true, id: doc.id };
            } catch (error) {
                console.error('[process] Extraction KO', { id: doc.id, name: doc.originalName, type: doc.mimeType, error: error instanceof Error ? error.message : String(error) });
                return { success: false, id: doc.id, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });

        const batchResults = await Promise.allSettled(batchPromises);
        processedDocuments += batchResults.length;

        // Progression
        if (processedDocuments % 5 === 0 || processedDocuments === totalDocuments) {
            console.log('[process] Progress', { processed: processedDocuments, total: totalDocuments, classificationId });
        }

        // Add small delay between batches to prevent overwhelming the system
        if (i + BATCH_SIZE < documents.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    // Filter out documents that failed text extraction
    // Also check if we need to extract text first (in case of re-processing)
    let documentsWithText = documents.filter(doc => doc.extractedText && doc.extractedText.trim().length > 0);

    // If no documents have extracted text, it means extraction failed or never happened
    if (documentsWithText.length === 0) {
        console.log('[process] No documents have extracted text, this might indicate extraction failed');
        // For now, let's try to re-extract text for all documents
        console.log('[process] Attempting to re-extract text for all documents...');

        for (const doc of documents) {
            try {
                const filePath = path.join(storage.getBasePath(), doc.filename);
                const text = await extractText(filePath, doc.mimeType);
                if (text && text.trim().length > 0) {
                    await prisma.documentMetadata.update({
                        where: { id: doc.id },
                        data: { extractedText: text },
                    });
                    console.log('[process] Re-extracted text for', doc.originalName, 'length:', text.length);
                }
            } catch (error) {
                console.error('[process] Failed to re-extract text for', doc.originalName, ':', error instanceof Error ? error.message : String(error));
            }
        }

        // Re-fetch documents after text extraction
        const updatedDocuments = await prisma.documentMetadata.findMany({ where: { classificationId } });
        documentsWithText = updatedDocuments.filter(doc => doc.extractedText && doc.extractedText.trim().length > 0);
    }

    const validDocuments = documentsWithText;

    console.log('[process] Extraction summary', {
        total: documents.length,
        withText: validDocuments.length,
        withoutText: documents.length - validDocuments.length,
        byType: Object.fromEntries(typeCounters)
    });

    // Détails des documents sans texte
    const docsWithoutText = documents.filter(doc => !doc.extractedText || doc.extractedText.trim().length === 0);
    docsWithoutText.forEach(doc => {
        console.log('[process] No text extracted', { id: doc.id, name: doc.originalName, type: doc.mimeType });
    });

    if (validDocuments.length === 0) {
        console.error('No documents have extractable text content after re-extraction attempt');
        console.error('Document details:', documents.map(d => ({
            id: d.id,
            filename: d.filename,
            mimeType: d.mimeType,
            hasExtractedText: !!(d.extractedText && d.extractedText.trim().length > 0)
        })));
        throw new Error('No documents could be processed - text extraction failed for all files');
    }

    // Échantillons de texte (100 premiers caractères) pour debug
    validDocuments.slice(0, 3).forEach((doc, idx) => {
        const sample = (doc.extractedText || '').slice(0, 100).replace(/\s+/g, ' ');
        console.log('[process] Text sample', { name: doc.originalName, sample });
    });

    console.log(`Starting classification for ${validDocuments.length} documents in classification ${classificationId}`);

    const docTexts = validDocuments.map((doc) => ({ id: doc.id, text: doc.extractedText || '' }));

    // Timeout de l’algorithme de classification (4 minutes)
    const classificationPromise = classifyDocuments(docTexts);
    const classificationTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Classification algorithm timeout after 4 minutes')), 4 * 60 * 1000); // 4 minutes
    });

    const algorithmStartTime = Date.now();
    console.log('[process] Classification start', { n: docTexts.length });

    let result;
    try {
        result = await Promise.race([classificationPromise, classificationTimeout]) as any;
    } catch (classificationError) {
        console.error('[process] Classification algorithm error:', classificationError);
        const errorMessage = classificationError instanceof Error ? classificationError.message : String(classificationError);
        throw new Error(`Classification algorithm failed: ${errorMessage}`);
    }

    console.log('[process] Classification done', { durationMs: Date.now() - algorithmStartTime });

    if (!result) {
        console.error('[process] Classification returned null/undefined result');
        throw new Error('Classification failed to produce results - returned null');
    }

    if (!result.categories || !Array.isArray(result.categories)) {
        console.error('[process] Classification result missing categories:', result);
        throw new Error('Classification failed to produce valid categories');
    }

    if (result.categories.length === 0) {
        console.error('[process] Classification produced empty categories');
        throw new Error('Classification produced no categories');
    }

    console.log('[process] Classification summary', { categories: result.categories.length });
    result.categories.forEach((cat: any, idx: number) => {
        console.log('[process] Category', { index: idx + 1, name: cat.name, size: cat.documents.length });
    });

    const proposedStructure = result;

    await updateClassification(classificationId, {
        status: 'READY',
        proposedStructure,
        processedAt: new Date() as any,
    });

    // Update documents with classification results
    console.log('[process] Updating documents with classification results...');
    for (const category of result.categories) {
        for (const doc of category.documents) {
            try {
                await prisma.documentMetadata.update({
                    where: { id: doc.id },
                    data: {
                        categoryName: category.name,
                        confidence: (doc as any).confidence,
                    },
                });
                console.log('[process] Updated document', doc.id, 'with category', category.name);
            } catch (updateError) {
                console.error('[process] Failed to update document', doc.id, ':', updateError instanceof Error ? updateError.message : String(updateError));
                // Continue with other documents even if one fails
            }
        }
    }

    console.log('[process] Completed and saved', { classificationId });
}