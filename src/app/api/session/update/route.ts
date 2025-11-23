/**
 * @fileoverview API route pour la mise à jour des sessions et documents.
 *
 * Ce endpoint permet de modifier les métadonnées d'une session
 * (statut, documents) et les catégories des documents individuels.
 *
 * @module api/session/update
 * @author DocClassifier Team
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sessionUpdateSchema } from '@/lib/validators/session-validator';
import { loadTaxonomy } from '@/lib/classification/taxonomy';

/**
 * Mise à jour complète d'une session.
 *
 * Permet de modifier plusieurs documents et le statut d'une session
 * en une seule requête.
 *
 * @async
 * @function PUT
 * @param {NextRequest} request - Requête avec sessionId, documents et status
 * @returns {Promise<NextResponse>} Session mise à jour avec ses documents
 */
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

/**
 * Mise à jour d'un document individuel.
 *
 * Modifie la catégorie et sous-catégorie d'un seul document.
 * Valide que les catégories existent dans la taxonomie.
 *
 * @async
 * @function PATCH
 * @param {NextRequest} request - Requête avec documentId, mainCategory, subCategory
 * @returns {Promise<NextResponse>} Document mis à jour
 */
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

        // Valider que la catégorie existe dans la taxonomie
        if (mainCategory && mainCategory.trim() !== '') {
            const taxonomy = loadTaxonomy();
            const categoryExists = taxonomy.some(cat =>
                cat.name === mainCategory ||
                cat.nameEn === mainCategory
            );

            if (!categoryExists) {
                return NextResponse.json(
                    {
                        success: false,
                        error: `La catégorie "${mainCategory}" n'existe pas dans la taxonomie`
                    },
                    { status: 400 }
                );
            }

            // Valider que la sous-catégorie appartient à la catégorie principale
            if (subCategory && subCategory.trim() !== '') {
                const category = taxonomy.find(cat =>
                    cat.name === mainCategory ||
                    cat.nameEn === mainCategory
                );

                const subcategoryExists = category?.children?.some(sub =>
                    sub.name === subCategory ||
                    sub.nameEn === subCategory
                );

                if (!subcategoryExists) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: `La sous-catégorie "${subCategory}" n'appartient pas à "${mainCategory}"`
                        },
                        { status: 400 }
                    );
                }
            }
        }

        // Mettre à jour un seul document
        const updatedDocument = await prisma.document.update({
            where: { id: documentId },
            data: {
                mainCategory: mainCategory || null,
                subCategory: subCategory || null,
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