import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateZip, cleanupZip } from '@/lib/zip/generator';
import { downloadRequestSchema } from '@/lib/validators/session-validator';
import { readFile } from 'fs/promises';
import { Document } from '@/types/document';

// Types pour l'aperçu des documents
interface DocumentPreview {
    id: string;
    originalName: string;
    mainCategory: string | null;
    subCategory: string | null;
    fileSize: number;
}

interface HierarchicalCategory {
    name: string;
    files: string[];
    subcategories: Record<string, { name: string; files: string[] }>;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Valider l'input
        const validation = downloadRequestSchema.safeParse(body);
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

        const { sessionId, options } = validation.data;

        // Récupérer la session et ses documents
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

        if (session.documents.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Aucun document à télécharger' },
                { status: 400 }
            );
        }

        // Générer le ZIP
        const documents: Document[] = session.documents.map(doc => ({
            ...doc,
            extractedText: doc.extractedText ?? undefined,
            language: doc.language ?? undefined,
            mainCategory: doc.mainCategory ?? undefined,
            subCategory: doc.subCategory ?? undefined,
            confidence: doc.confidence ?? undefined,
            pageCount: doc.pageCount ?? undefined,
            wordCount: doc.wordCount ?? undefined,
        }));
        const result = await generateZip(sessionId, documents, options);

        // Lire le fichier ZIP
        const zipBuffer = await readFile(result.zipPath);

        // Créer la réponse avec le fichier ZIP
        const response = new NextResponse(new Uint8Array(zipBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="classifier_${sessionId}.zip"`,
                'Content-Length': result.size.toString(),
            },
        });

        // Nettoyer le ZIP temporaire après l'envoi
        setTimeout(async () => {
            try {
                await cleanupZip(result.zipPath);
            } catch (error) {
                console.error('Erreur lors du nettoyage du ZIP:', error);
            }
        }, 1000);

        // Optionnel : Supprimer la session après le téléchargement
        // (décommenter si vous voulez une suppression automatique)
        /*
        setTimeout(async () => {
          await deleteSessionFiles(sessionId);
          await deleteSession(sessionId);
        }, 5000);
        */

        return response;
    } catch (error) {
        console.error('Download error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erreur lors de la génération du ZIP',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

// Endpoint pour obtenir un aperçu de la structure avant téléchargement
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');
        const structure = (searchParams.get('structure') as 'flat' | 'hierarchical') || 'hierarchical';

        if (!sessionId) {
            return NextResponse.json(
                { success: false, error: 'Session ID manquant' },
                { status: 400 }
            );
        }

        // Récupérer les documents
        const documents = await prisma.document.findMany({
            where: { sessionId },
            select: {
                id: true,
                originalName: true,
                mainCategory: true,
                subCategory: true,
                fileSize: true,
            },
        });

        // Créer un aperçu de la structure
        const preview = structure === 'hierarchical'
            ? createHierarchicalPreview(documents)
            : createFlatPreview(documents);

        return NextResponse.json({
            success: true,
            data: {
                structure,
                totalFiles: documents.length,
                totalSize: documents.reduce((sum, doc) => sum + doc.fileSize, 0),
                preview,
            },
        });
    } catch (error) {
        console.error('Preview error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erreur lors de la génération de l\'aperçu',
            },
            { status: 500 }
        );
    }
}

function createHierarchicalPreview(documents: DocumentPreview[]): Record<string, HierarchicalCategory> {
    const structure: Record<string, HierarchicalCategory> = {};

    documents.forEach(doc => {
        const category = doc.mainCategory || 'Uncategorized';

        if (!structure[category]) {
            structure[category] = {
                name: category,
                files: [],
                subcategories: {},
            };
        }

        if (doc.subCategory) {
            if (!structure[category].subcategories[doc.subCategory]) {
                structure[category].subcategories[doc.subCategory] = {
                    name: doc.subCategory,
                    files: [],
                };
            }
            structure[category].subcategories[doc.subCategory].files.push(doc.originalName);
        } else {
            structure[category].files.push(doc.originalName);
        }
    });

    return structure;
}

function createFlatPreview(documents: DocumentPreview[]): string[] {
    return documents.map(doc => {
        const prefix = doc.mainCategory ? `[${doc.mainCategory}]_` : '';
        return `${prefix}${doc.originalName}`;
    });
}