import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import prisma from '@/lib/db/prisma';
import { extractText } from '@/lib/classifier/textExtractor';
import { classifyDocuments } from '@/lib/classifier/categorizer';
import { getClassificationById, updateClassification } from '@/lib/db/queries/classifications';
import { bulkCreateDocuments } from '@/lib/db/queries/documents';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const classificationId = params.id;
        const classification = await getClassificationById(classificationId);
        if (!classification || classification.userId !== session.user.id) {
            return NextResponse.json({ error: 'Classification not found or unauthorized' }, { status: 404 });
        }

        // Assume documents are already uploaded and have filepaths and mimeTypes in DB or temp storage
        // For simplicity, fetch documents from DB or temp; here pseudo-code
        const documents = await prisma.document.findMany({ where: { classificationId } }); // Adjust model

        for (const doc of documents) {
            const text = await extractText(doc.filepath, doc.mimeType);
            await prisma.document.update({
                where: { id: doc.id },
                data: { extractedText: text },
            });
        }

        const docTexts = documents.map((doc) => ({ id: doc.id, text: doc.extractedText || '' }));
        const result = classifyDocuments(docTexts);

        const proposedStructure = JSON.stringify(result); // Or structured format

        await updateClassification(classificationId, {
            status: 'READY',
            proposedStructure,
        });

        // Create metadata; assume bulkCreateDocuments handles it
        await bulkCreateDocuments(result.documents.map((doc) => ({
            // Map to DB schema
            classificationId,
            documentId: doc.id,
            confidence: doc.confidence,
            // etc.
        })));

        return NextResponse.json({ classification: { ...classification, proposedStructure } });
    } catch (error) {
        console.error('Error processing classification:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}