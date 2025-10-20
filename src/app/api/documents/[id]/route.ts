import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import prisma from '@/lib/db/prisma';

// GET /api/documents/[id] - Get document details
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
                        createdAt: true,
                    },
                },
            },
        });

        if (!document || document.classification.userId !== session.user.id) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        return NextResponse.json({ document });
    } catch (error) {
        console.error('Error fetching document:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/documents/[id] - Delete a document
export async function DELETE(
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
                        userId: true,
                    },
                },
            },
        });

        if (!document || document.classification.userId !== session.user.id) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        await prisma.documentMetadata.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting document:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}