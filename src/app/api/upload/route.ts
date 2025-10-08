import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import prisma from '@/lib/db/prisma';
import { TempStorage } from '@/lib/storage/tempStorage';
import { fileSchema } from '@/lib/validators/uploadSchemas';
import { ClassificationCreateInput } from '@/types/classification';
import { nanoid } from 'nanoid'; // Assume added to deps if needed
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth();

        const formData = await request.formData();
        const files = formData.getAll('files') as File[];

        if (files.length === 0) {
            return NextResponse.json({ error: 'No files provided' }, { status: 400 });
        }

        // Validate files
        const validFiles = files.filter((file) => {
            const result = fileSchema.safeParse({
                name: file.name,
                size: file.size,
                type: file.type,
            });
            return result.success;
        });

        if (validFiles.length === 0) {
            return NextResponse.json({ error: 'No valid files' }, { status: 400 });
        }

        const sessionId = nanoid();
        const storage = new TempStorage(sessionId);
        await storage.init();

        const totalSize = validFiles.reduce((sum, f) => sum + f.size, 0);

        // Save files and keep the same generated filename for DB
        const savedFiles: Array<{ filename: string; file: File }> = [];
        for (const file of validFiles) {
            const filename = `${Date.now()}-${file.name}`;
            const buffer = Buffer.from(await file.arrayBuffer());
            await fs.writeFile(path.join(storage.getBasePath(), filename), buffer);
            savedFiles.push({ filename, file });
        }

        // Create classification
        const classificationData = {
            userId: user.id,
            sessionId,
            status: 'PROCESSING' as const,
            proposedStructure: [] as any, // Empty initial structure
            totalDocuments: validFiles.length,
            totalSize: BigInt(totalSize),
        };

        const classification = await prisma.classification.create({
            data: classificationData,
        });

        // Trigger classification processing asynchronously
        try {
            // Create document records first
            const documentPromises = savedFiles.map(async ({ filename, file }) => {
                return prisma.documentMetadata.create({
                    data: {
                        classificationId: classification.id,
                        filename,
                        originalName: file.name,
                        mimeType: file.type,
                        fileSize: file.size,
                    },
                });
            });

            await Promise.all(documentPromises);

            // Trigger classification processing in background
            const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
            fetch(`${baseUrl}/api/classification/${classification.id}/process`, {
                method: 'POST',
                headers: {
                    'x-job-secret': process.env.JOB_SECRET || '',
                },
            }).catch(error => {
                console.error('Background classification processing failed:', error);
            });

        } catch (error) {
            console.error('Error setting up classification processing:', error);
            // Don't fail the upload if processing setup fails
        }

        return NextResponse.json({
            success: true,
            data: { classificationId: classification.id, sessionId, totalFiles: validFiles.length },
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}