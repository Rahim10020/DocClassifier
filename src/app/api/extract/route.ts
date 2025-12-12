/**
 * @fileoverview API route pour l'extraction de texte des documents.
 *
 * Ce endpoint extrait le contenu textuel des documents uploadés
 * et détecte leur langue pour la classification ultérieure.
 *
 * @module api/extract
 * @author DocClassifier Team
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readFile } from '@/lib/storage';
import { extractText } from '@/lib/extractors';
import { detectLanguage } from '@/lib/classification/language-detector';
import { updateSessionStatus, incrementProcessedFiles } from '@/lib/session';

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
 * Extraction du texte des documents d'une session.
 *
 * Lit chaque fichier, extrait son contenu textuel et détecte la langue.
 * Le traitement est effectué par lots de 10 documents.
 *
 * @async
 * @function POST
 * @param {NextRequest} request - Requête avec sessionId
 * @returns {Promise<NextResponse>} Résultats d'extraction par document
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

        const documents = await prisma.document.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'asc' },
        });

        if (documents.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Aucun document trouvé' },
                { status: 404 }
            );
        }

        await updateSessionStatus(sessionId, 'extracting');

        // Traiter par batch de 10
        const results = await processInBatches(
            documents,
            10,
            async (doc) => {
                try {
                    const buffer = await readFile(sessionId, doc.fileName);
                    const extraction = await extractText(buffer, doc.fileType);

                    // Gérer les docs sans texte
                    const hasText = extraction.text && extraction.text.trim().length > 0;
                    const detectedLanguage = hasText
                        ? detectLanguage(extraction.text)
                        : 'unknown';

                    const wordCount = extraction.wordCount ||
                        (hasText ? extraction.text.split(/\s+/).filter(w => w.length > 0).length : 0);

                    await prisma.document.update({
                        where: { id: doc.id },
                        data: {
                            extractedText: extraction.text || null,  // null si vide
                            language: detectedLanguage,
                            pageCount: extraction.pageCount,
                            wordCount,
                            // Keep existing review fields untouched (no-op) to avoid overwriting
                        },
                    });

                    await incrementProcessedFiles(sessionId);

                    return {
                        documentId: doc.id,
                        name: doc.originalName,
                        success: true,
                        language: detectedLanguage,
                        wordCount,
                        pageCount: extraction.pageCount,
                        hasText,  // Info si texte présent
                    };
                } catch (error) {
                    console.error(`Error extracting ${doc.originalName}:`, error);
                    return {
                        documentId: doc.id,
                        name: doc.originalName,
                        success: false,
                        error: error instanceof Error ? error.message : 'Extraction failed',
                    };
                }
            }
        );

        await updateSessionStatus(sessionId, 'classifying');

        return NextResponse.json({
            success: true,
            data: {
                sessionId,
                totalDocuments: documents.length,
                processedDocuments: results.filter(r => r?.success).length,
                failedDocuments: results.filter(r => r && !r.success).length,
                results,
            },
        });
    } catch (error) {
        console.error('Extract error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erreur lors de l\'extraction',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}