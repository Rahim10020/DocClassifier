import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import prisma from '@/lib/db/prisma';

// PUT /api/documents/[id]/move - Move document to a different category
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { categoryPath } = await req.json();

        if (!categoryPath || typeof categoryPath !== 'string') {
            return NextResponse.json({ error: 'Valid category path is required' }, { status: 400 });
        }

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

        const updatedDocument = await prisma.documentMetadata.update({
            where: { id: params.id },
            data: {
                categoryPath,
            },
        });

        return NextResponse.json({ document: updatedDocument });
    } catch (error) {
        console.error('Error moving document:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}