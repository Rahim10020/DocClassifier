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
        const session = await prisma.session.findUnique({
            where: { id: sessionId },
        });

        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Session non trouvée' },
                { status: 404 }
            );
        }

        // Mettre à jour les documents si fournis
        if (documents && documents.length > 0) {
            for (const doc of documents) {
                await prisma.document.update({
                    where: { id: doc.id },
                    data: {
                        mainCategory: doc.mainCategory,
                        subCategory: doc.subCategory,
                        confidence: doc.confidence,
                    },
                });
            }
        }

        // Mettre à jour le statut de la session si fourni
        if (status) {
            await prisma.session.update({
                where: { id: sessionId },
                data: { status },
            });
        }

        // Récupérer la session mise à jour
        const updatedSession = await prisma.session.findUnique({
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