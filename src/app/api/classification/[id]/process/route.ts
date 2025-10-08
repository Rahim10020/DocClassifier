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

        // Fetch documents from database
        const documents = await prisma.documentMetadata.findMany({ where: { classificationId } });

        // Create temp storage instance to access files
        const classificationData = await getClassificationById(classificationId);
        if (!classificationData?.sessionId) {
            throw new Error('Session ID not found for classification');
        }

        const storage = new TempStorage(classificationData.sessionId);

        for (const doc of documents) {
            const filePath = path.join(storage.getBasePath(), doc.filename);
            const text = await extractText(filePath, doc.mimeType);
            await prisma.documentMetadata.update({
                where: { id: doc.id },
                data: { extractedText: text },
            });
        }

        const docTexts = documents.map((doc) => ({ id: doc.id, text: doc.extractedText || '' }));
        const result = classifyDocuments(docTexts);

        const proposedStructure = result; // Keep as structured object

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

        return NextResponse.json({ classification: { ...classification, proposedStructure } });
    } catch (error) {
        console.error('Error processing classification:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}