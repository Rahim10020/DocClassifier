import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import prisma from '@/lib/db/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const classificationId = params.id;
    const body = await req.json();
    // body.categoryChanges: { renamed, moved, created, deleted, merged }

    try {
        // Implement DB updates for categories and documents
        // For example:
        await prisma.$transaction(async (tx: any) => {
            // Update finalStructure
            await tx.classification.update({
                where: { id: classificationId },
                data: { finalStructure: body },
            });
            // Update DocumentMetadata based on category changes
            // This would involve updating document-category relationships
        });

        const updated = await prisma.classification.findUnique({ where: { id: classificationId } });
        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating classification:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}