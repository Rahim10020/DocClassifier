import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession, updateSessionTotalFiles } from '@/lib/session';
import { saveFile, ensureStorageDirectory } from '@/lib/storage';
import { validateFiles } from '@/lib/validators/file-validator';

export async function POST(request: NextRequest) {
    try {
        // Assurer que le dossier de stockage existe
        await ensureStorageDirectory();

        // Parser le FormData
        const formData = await request.formData();
        const files = formData.getAll('files') as File[];
        const profile = formData.get('profile') as string | null;
        const language = (formData.get('language') as string) || 'fr';

        // Validation des fichiers
        const validation = validateFiles(files);
        if (!validation.valid) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation des fichiers échouée',
                    details: validation.errors,
                },
                { status: 400 }
            );
        }

        // Créer la session
        const session = await createSession(profile || undefined, language);

        // Sauvegarder chaque fichier
        const savedDocuments = [];

        for (const file of files) {
            try {
                // Sauvegarder le fichier sur le disque
                const fileName = await saveFile(session.id, file);
                const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'unknown';

                // Créer l'entrée en base de données
                const document = await prisma.document.create({
                    data: {
                        sessionId: session.id,
                        originalName: file.name,
                        fileName,
                        fileType: fileExtension,
                        fileSize: file.size,
                        filePath: fileName,
                        keywords: [],
                    },
                });

                savedDocuments.push(document);
            } catch (error) {
                console.error(`Error saving file ${file.name}:`, error);
                // Continuer avec les autres fichiers
            }
        }

        // Mettre à jour le nombre total de fichiers
        await updateSessionTotalFiles(session.id, savedDocuments.length);

        return NextResponse.json({
            success: true,
            data: {
                sessionId: session.id,
                totalFiles: savedDocuments.length,
                documents: savedDocuments.map(doc => ({
                    id: doc.id,
                    name: doc.originalName,
                    size: doc.fileSize,
                    type: doc.fileType,
                })),
            },
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erreur lors de l\'upload des fichiers',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};