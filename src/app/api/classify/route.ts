import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { classifyDocument } from '@/lib/classification/classifier';
import { updateSessionStatus } from '@/lib/session';
import { Profile } from '@/types/category';

async function processInBatches<T, R>(
    items: T[],
    batchSize: number,
    processor: (item: T) => Promise<R>
): Promise<R[]> {
    const results: R[] = [];

    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.allSettled(
            batch.map(item => processor(item))
        );

        results.push(
            ...batchResults.map((result, idx) => {
                if (result.status === 'fulfilled') {
                    return result.value;
                } else {
                    console.error(`Error processing item ${i + idx}:`, result.reason);
                    return null as R;
                }
            })
        );
    }

    return results.filter(r => r !== null);
}

export async function POST(request: NextRequest) {
    try {
        const { sessionId } = await request.json();

        if (!sessionId) {
            return NextResponse.json(
                { success: false, error: 'Session ID manquant' },
                { status: 400 }
            );
        }

        const session = await prisma.classificationSession.findUnique({
            where: { id: sessionId },
            include: { documents: true },
        });

        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Session non trouvée' },
                { status: 404 }
            );
        }

        // Inclure les docs AVEC ou SANS texte
        const documents = session.documents;

        if (documents.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Aucun document trouvé' },
                { status: 400 }
            );
        }

        // Classifier par batch de 10
        const results = await processInBatches(
            documents,
            10,
            async (doc) => {
                try {
                    const classification = await classifyDocument({
                        documentId: doc.id,
                        text: doc.extractedText || '',
                        language: doc.language || 'fr',
                        profile: session.profile as Profile | undefined,
                    });

                    await prisma.document.update({
                        where: { id: doc.id },
                        data: {
                            mainCategory: classification.mainCategory,
                            subCategory: classification.subCategory,
                            confidence: classification.confidence,
                            keywords: classification.keywords,
                        },
                    });

                    return {
                        documentId: doc.id,
                        name: doc.originalName,
                        success: true,
                        mainCategory: classification.mainCategory,
                        subCategory: classification.subCategory,
                        confidence: classification.confidence,
                    };
                } catch (error) {
                    console.error(`Error classifying ${doc.originalName}:`, error);
                    return {
                        documentId: doc.id,
                        name: doc.originalName,
                        success: false,
                        error: error instanceof Error ? error.message : 'Classification failed',
                    };
                }
            }
        );

        await updateSessionStatus(sessionId, 'ready');

        return NextResponse.json({
            success: true,
            data: {
                sessionId,
                totalDocuments: documents.length,
                classifiedDocuments: results.filter(r => r?.success).length,
                failedDocuments: results.filter(r => r && !r.success).length,
                results,
            },
        });
    } catch (error) {
        console.error('Classify error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erreur lors de la classification',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}