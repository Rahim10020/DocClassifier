import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sessionUpdateSchema } from '@/lib/validators/session-validator';

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        // Valider l'input
        const validation = sessionUpdateSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Données invalides',
                    details: validation.error.errors,
                },
                { status: 400 }
            );
        }

        const { sessionId, documents, status } = validation.data;

        // Vérifier que la session existe
        const session = await prisma.classificationSession.findUnique({
            where: { id: sessionId },
        });

        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Session non trouvée' },
                { status: 404 }
            );
        }

        // Mettre à jour les documents si fournis (en parallèle pour meilleure performance)
        if (documents && documents.length > 0) {
            await Promise.all(
                documents.map(doc =>
                    prisma.document.update({
                        where: { id: doc.id },
                        data: {
                            mainCategory: doc.mainCategory,
                            subCategory: doc.subCategory,
                            confidence: doc.confidence,
                        },
                    }).catch(error => {
                        console.error(`Erreur lors de la mise à jour du document ${doc.id}:`, error);
                        throw error;
                    })
                )
            );
        }

        // Mettre à jour le statut de la session si fourni
        if (status) {
            await prisma.classificationSession.update({
                where: { id: sessionId },
                data: { status },
            });
        }

        // Récupérer la session mise à jour
        const updatedSession = await prisma.classificationSession.findUnique({
            where: { id: sessionId },
            include: { documents: true },
        });

        return NextResponse.json({
            success: true,
            data: updatedSession,
        });
    } catch (error) {
        console.error('Update session error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erreur lors de la mise à jour de la session',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { documentId, mainCategory, subCategory } = body;

        if (!documentId) {
            return NextResponse.json(
                { success: false, error: 'Document ID manquant' },
                { status: 400 }
            );
        }

        // Validation des catégories
        if (mainCategory && typeof mainCategory !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Catégorie principale invalide' },
                { status: 400 }
            );
        }

        if (subCategory && typeof subCategory !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Sous-catégorie invalide' },
                { status: 400 }
            );
        }

        // Mettre à jour un seul document
        const updatedDocument = await prisma.document.update({
            where: { id: documentId },
            data: {
                mainCategory,
                subCategory,
            },
        });

        return NextResponse.json({
            success: true,
            data: updatedDocument,
        });
    } catch (error) {
        console.error('Update document error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erreur lors de la mise à jour du document',
            },
            { status: 500 }
        );
    }
}