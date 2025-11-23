/**
 * @fileoverview API route pour la classification des documents.
 *
 * Ce endpoint classifie les documents extraits en utilisant le moteur
 * NLP (TF-IDF, mots-clés) pour assigner des catégories et sous-catégories.
 *
 * @module api/classify
 * @author DocClassifier Team
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { classifyDocument } from '@/lib/classification/classifier';
import { updateSessionStatus } from '@/lib/session';
import { Profile } from '@/types/category';

/**
 * Traite des éléments par lots pour éviter la surcharge mémoire.
 *
 * @async
 * @function processInBatches
 * @template T - Type des éléments à traiter
 * @template R - Type des résultats
 * @param {T[]} items - Éléments à traiter
 * @param {number} batchSize - Taille des lots
 * @param {Function} processor - Fonction de traitement
 * @returns {Promise<R[]>} Résultats du traitement
 */
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

/**
 * Classification des documents d'une session.
 *
 * Récupère les documents avec leur texte extrait et les classifie
 * en utilisant le profil de la session. Le traitement est effectué
 * par lots de 10 documents.
 *
 * @async
 * @function POST
 * @param {NextRequest} request - Requête avec sessionId
 * @returns {Promise<NextResponse>} Résultats de classification par document
 */
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
                    console.log(`[API Classify] Starting classification for: ${doc.originalName}`);

                    const classification = await classifyDocument({
                        documentId: doc.id,
                        text: doc.extractedText || '',
                        language: doc.language || 'fr',
                        profile: session.profile as Profile | undefined,
                    });

                    console.log(`[API Classify] Classification result for ${doc.originalName}:`, {
                        mainCategory: classification.mainCategory,
                        subCategory: classification.subCategory,
                        confidence: classification.confidence,
                        keywordsCount: classification.keywords?.length || 0,
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

                    console.log(`[API Classify] ✓ Document updated in DB: ${doc.originalName}`);

                    return {
                        documentId: doc.id,
                        name: doc.originalName,
                        success: true,
                        mainCategory: classification.mainCategory,
                        subCategory: classification.subCategory,
                        confidence: classification.confidence,
                    };
                } catch (error) {
                    console.error(`[API Classify] ❌ Error classifying ${doc.originalName}:`, error);
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