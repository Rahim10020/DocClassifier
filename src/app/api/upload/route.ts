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
        await requireAuth();

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

        // Save files
        for (const file of validFiles) {
            const filename = `${Date.now()}-${file.name}`;
            const buffer = Buffer.from(await file.arrayBuffer());
            await fs.writeFile(path.join(storage.getBasePath(), filename), buffer);
        }

        // Create classification
        const classificationData: ClassificationCreateInput = {
            userId: (await requireAuth()).id,
            sessionId,
            status: 'PROCESSING',
            proposedStructure: JSON.stringify([]), // Empty initial
            totalDocuments: validFiles.length,
            totalSize: BigInt(totalSize),
        };

        const classification = await prisma.classification.create({
            data: classificationData,
        });

        return NextResponse.json({
            success: true,
            data: { classificationId: classification.id, sessionId, totalFiles: validFiles.length },
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}