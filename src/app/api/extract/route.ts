import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readFile } from '@/lib/storage';
import { extractText } from '@/lib/extractors';
import { detectLanguage } from '@/lib/classification/language-detector';
import { updateSessionStatus, incrementProcessedFiles } from '@/lib/session';

export async function POST(request: NextRequest) {
    try {
        const { sessionId } = await request.json();

        if (!sessionId) {
            return NextResponse.json(
                { success: false, error: 'Session ID manquant' },
                { status: 400 }
            );
        }

        // Récupérer tous les documents de la session
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

        // Mettre à jour le statut de la session
        await updateSessionStatus(sessionId, 'extracting');

        const results = [];

        // Extraire le texte de chaque document
        for (const doc of documents) {
            try {
                // Lire le fichier
                const buffer = await readFile(sessionId, doc.fileName);

                // Extraire le texte selon le type
                const extraction = await extractText(buffer, doc.fileType);

                // Détecter la langue
                const detectedLanguage = detectLanguage(extraction.text);

                // Compter les mots
                const wordCount = extraction.wordCount ||
                    extraction.text.split(/\s+/).filter(w => w.length > 0).length;

                // Mettre à jour le document
                await prisma.document.update({
                    where: { id: doc.id },
                    data: {
                        extractedText: extraction.text,
                        language: detectedLanguage,
                        pageCount: extraction.pageCount,
                        wordCount,
                    },
                });

                // Incrémenter le compteur de fichiers traités
                await incrementProcessedFiles(sessionId);

                results.push({
                    documentId: doc.id,
                    name: doc.originalName,
                    success: true,
                    language: detectedLanguage,
                    wordCount,
                    pageCount: extraction.pageCount,
                });
            } catch (error) {
                console.error(`Error extracting ${doc.originalName}:`, error);
                results.push({
                    documentId: doc.id,
                    name: doc.originalName,
                    success: false,
                    error: error instanceof Error ? error.message : 'Extraction failed',
                });
            }
        }

        // Mettre à jour le statut vers "classifying"
        await updateSessionStatus(sessionId, 'classifying');

        return NextResponse.json({
            success: true,
            data: {
                sessionId,
                totalDocuments: documents.length,
                processedDocuments: results.filter(r => r.success).length,
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