import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import prisma from '@/lib/db/prisma';

// DELETE /api/documents/bulk-delete - Delete multiple documents
export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { documentIds } = await req.json();

        if (!Array.isArray(documentIds) || documentIds.length === 0) {
            return NextResponse.json({ error: 'Document IDs array is required' }, { status: 400 });
        }

        // Verify all documents belong to the authenticated user
        const documents = await prisma.documentMetadata.findMany({
            where: {
                id: { in: documentIds },
                classification: {
                    userId: session.user.id,
                },
            },
            select: {
                id: true,
                classificationId: true,
            },
        });

        if (documents.length !== documentIds.length) {
            return NextResponse.json({ error: 'Some documents not found or unauthorized' }, { status: 404 });
        }

        // Delete the documents
        await prisma.documentMetadata.deleteMany({
            where: {
                id: { in: documentIds },
                classification: {
                    userId: session.user.id,
                },
            },
        });

        return NextResponse.json({
            success: true,
            deletedCount: documents.length
        });
    } catch (error) {
        console.error('Error bulk deleting documents:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}