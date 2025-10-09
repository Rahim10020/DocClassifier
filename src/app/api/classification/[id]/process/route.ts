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
    // Add timeout to prevent infinite processing (5 minutes)
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Processing timeout after 5 minutes')), 5 * 60 * 1000);
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

        // Race between processing and timeout
        await Promise.race([
            performClassificationProcess(classificationId),
            timeoutPromise
        ]);

        return NextResponse.json({ success: true, message: 'Classification completed successfully' });
    } catch (error) {
        console.error('Error processing classification:', error);

        // Update classification status to READY if processing fails (mark as ready so polling stops)
        try {
            const classificationId = params.id;
            await updateClassification(classificationId, {
                status: 'READY' // Mark as ready so polling stops, even though processing failed
            });
        } catch (updateError) {
            console.error('Error updating classification status:', updateError);
        }

        if (error instanceof Error && error.message.includes('timeout')) {
            return NextResponse.json({
                error: 'Processing timeout - classification took too long to complete',
                code: 'TIMEOUT'
            }, { status: 408 });
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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

    // Process documents with parallel text extraction for better performance
    const totalDocuments = documents.length;
    const BATCH_SIZE = 5; // Process 5 documents in parallel
    let processedDocuments = 0;

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
                return { success: true, id: doc.id };
            } catch (error) {
                console.error(`Error processing document ${doc.filename}:`, error);
                return { success: false, id: doc.id, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });

        const batchResults = await Promise.allSettled(batchPromises);
        processedDocuments += batchResults.length;

        // Update progress for this batch
        if (processedDocuments % 5 === 0 || processedDocuments === totalDocuments) {
            console.log(`Processed ${processedDocuments}/${totalDocuments} documents for classification ${classificationId}`);
        }

        // Add small delay between batches to prevent overwhelming the system
        if (i + BATCH_SIZE < documents.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    // Filter out documents that failed text extraction
    const validDocuments = documents.filter(doc => doc.extractedText && doc.extractedText.trim().length > 0);

    console.log(`Text extraction results for classification ${classificationId}:`);
    console.log(`- Total documents: ${documents.length}`);
    console.log(`- Documents with text: ${validDocuments.length}`);
    console.log(`- Documents without text: ${documents.length - validDocuments.length}`);

    // Log details of documents without text
    const docsWithoutText = documents.filter(doc => !doc.extractedText || doc.extractedText.trim().length === 0);
    docsWithoutText.forEach(doc => {
        console.log(`Document without text: ${doc.originalName} (${doc.mimeType})`);
    });

    if (validDocuments.length === 0) {
        console.error('No documents have extractable text content');
        throw new Error('No documents could be processed - text extraction failed for all files');
    }

    // Log sample text content for debugging
    validDocuments.slice(0, 3).forEach((doc, idx) => {
        console.log(`Sample text from document ${doc.originalName}: "${doc.extractedText?.substring(0, 200)}..."`);
    });

    console.log(`Starting classification for ${validDocuments.length} documents in classification ${classificationId}`);

    const docTexts = validDocuments.map((doc) => ({ id: doc.id, text: doc.extractedText || '' }));

    // Add timeout to classification algorithm itself (increased to 4 minutes)
    const classificationPromise = classifyDocuments(docTexts);
    const classificationTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Classification algorithm timeout after 4 minutes')), 4 * 60 * 1000); // 4 minutes
    });

    const algorithmStartTime = Date.now();
    console.log(`Starting classification algorithm with ${docTexts.length} documents...`);
    const result = await Promise.race([classificationPromise, classificationTimeout]) as any;
    console.log(`Classification algorithm completed in ${Date.now() - algorithmStartTime}ms`);

    if (!result || !result.categories) {
        throw new Error('Classification failed to produce results');
    }

    console.log(`Classification completed successfully:`);
    console.log(`- Categories created: ${result.categories.length}`);
    result.categories.forEach((cat: any, idx: number) => {
        console.log(`  Category ${idx + 1}: "${cat.name}" with ${cat.documents.length} documents`);
        cat.documents.forEach((doc: any) => {
            console.log(`    - ${doc.originalName}: ${(doc as any).confidence?.toFixed(2) || '0.00'} confidence`);
        });
    });

    const proposedStructure = result;

    await updateClassification(classificationId, {
        status: 'READY',
        proposedStructure,
        processedAt: new Date() as any,
    });

    // Update documents with classification results
    for (const category of result.categories) {
        for (const doc of category.documents) {
            await prisma.documentMetadata.update({
                where: { id: doc.id },
                data: {
                    categoryName: category.name,
                    confidence: (doc as any).confidence,
                },
            });
        }
    }

    console.log(`Classification ${classificationId} fully completed and saved to database`);
}