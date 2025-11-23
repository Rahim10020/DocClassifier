/**
 * @fileoverview API route pour l'upload de fichiers.
 *
 * Ce endpoint gère la réception des fichiers, leur validation,
 * la création d'une session et le stockage sur disque.
 *
 * @module api/upload
 * @author DocClassifier Team
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession, updateSessionTotalFiles } from '@/lib/session';
import { saveFile, ensureStorageDirectory } from '@/lib/storage';
import { validateFiles } from '@/lib/validators/file-validator';

/**
 * Upload de fichiers et création de session.
 *
 * Reçoit les fichiers via FormData, les valide, crée une session
 * et sauvegarde les fichiers sur le disque.
 *
 * @async
 * @function POST
 * @param {NextRequest} request - Requête avec FormData (files, profile, language)
 * @returns {Promise<NextResponse>} Session ID et liste des documents créés
 */
export async function POST(request: NextRequest) {
    try {
        // Assurer que le dossier de stockage existe
        await ensureStorageDirectory();

        // Parser le FormData
        const formData = await request.formData();
        const filesRaw = formData.getAll('files');
        const profileRaw = formData.get('profile');
        const languageRaw = formData.get('language');

        // Validation des types
        const files: File[] = [];
        for (const fileRaw of filesRaw) {
            if (!(fileRaw instanceof File)) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Format de fichier invalide',
                    },
                    { status: 400 }
                );
            }
            files.push(fileRaw);
        }

        const profile = profileRaw && typeof profileRaw === 'string' ? profileRaw : undefined;
        const language = languageRaw && typeof languageRaw === 'string' ? languageRaw : 'fr';

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
        const session = await createSession(profile, language);

        // Sauvegarder chaque fichier
        const savedDocuments = [];
        const failedFiles: { name: string; error: string }[] = [];

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
                failedFiles.push({
                    name: file.name,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }

        // Mettre à jour le nombre total de fichiers
        await updateSessionTotalFiles(session.id, savedDocuments.length);

        return NextResponse.json({
            success: savedDocuments.length > 0,
            data: {
                sessionId: session.id,
                totalFiles: savedDocuments.length,
                failedFiles: failedFiles.length > 0 ? failedFiles : undefined,
                documents: savedDocuments.map(doc => ({
                    id: doc.id,
                    name: doc.originalName,
                    size: doc.fileSize,
                    type: doc.fileType,
                })),
            },
            warning: failedFiles.length > 0
                ? `${failedFiles.length} fichier(s) n'ont pas pu être uploadés`
                : undefined,
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