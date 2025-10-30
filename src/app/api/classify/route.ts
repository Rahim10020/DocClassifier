import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { classifyDocument } from '@/lib/classification/classifier';
import { updateSessionStatus } from '@/lib/session';
import { Profile } from '@/types/category';
import { Document } from '@/types/document';

export async function POST(request: NextRequest) {
    try {
        const { sessionId } = await request.json();

        if (!sessionId) {
            return NextResponse.json(
                { success: false, error: 'Session ID manquant' },
                { status: 400 }
            );
        }

        // Récupérer la session et ses documents
        const session = await prisma.session.findUnique({
            where: { id: sessionId },
            include: { documents: true },
        });

        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Session non trouvée' },
                { status: 404 }
            );
        }

        const documents = session.documents.filter((doc: Document) => doc.extractedText);

        if (documents.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Aucun document avec texte extrait' },
                { status: 400 }
            );
        }

        const results = [];

        // Classifier chaque document
        for (const doc of documents) {
            try {
                const classification = await classifyDocument({
                    documentId: doc.id,
                    text: doc.extractedText!,
                    language: doc.language || 'fr',
                    profile: session.profile as Profile | undefined,
                });

                // Mettre à jour le document avec la classification
                await prisma.document.update({
                    where: { id: doc.id },
                    data: {
                        mainCategory: classification.mainCategory,
                        subCategory: classification.subCategory,
                        confidence: classification.confidence,
                        keywords: classification.keywords,
                    },
                });

                results.push({
                    documentId: doc.id,
                    name: doc.originalName,
                    success: true,
                    mainCategory: classification.mainCategory,
                    subCategory: classification.subCategory,
                    confidence: classification.confidence,
                });
            } catch (error) {
                console.error(`Error classifying ${doc.originalName}:`, error);
                results.push({
                    documentId: doc.id,
                    name: doc.originalName,
                    success: false,
                    error: error instanceof Error ? error.message : 'Classification failed',
                });
            }
        }

        // Mettre à jour le statut de la session à "ready"
        await updateSessionStatus(sessionId, 'ready');

        return NextResponse.json({
            success: true,
            data: {
                sessionId,
                totalDocuments: documents.length,
                classifiedDocuments: results.filter(r => r.success).length,
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