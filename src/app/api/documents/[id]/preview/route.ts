import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import prisma from '@/lib/db/prisma';

// GET /api/documents/[id]/preview - Get document preview/content
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const document = await prisma.documentMetadata.findUnique({
            where: { id: params.id },
            include: {
                classification: {
                    select: {
                        id: true,
                        userId: true,
                        status: true,
                    },
                },
            },
        });

        if (!document || document.classification.userId !== session.user.id) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        // Return document metadata and preview of extracted text
        const preview = {
            id: document.id,
            originalName: document.originalName,
            filename: document.filename,
            fileSize: document.fileSize,
            mimeType: document.mimeType,
            categoryName: document.categoryName,
            categoryPath: document.categoryPath,
            confidence: document.confidence,
            extractedText: document.extractedText?.substring(0, 1000), // First 1000 chars as preview
            createdAt: document.createdAt,
        };

        return NextResponse.json({ preview });
    } catch (error) {
        console.error('Error fetching document preview:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}