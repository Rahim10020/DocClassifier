import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import prisma from '@/lib/db/prisma';
import { ClassificationStatus } from '@/types/classification';

// PUT /api/classification/[id]/status - Update classification status
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { status } = await req.json();

        if (!status || !Object.values(ClassificationStatus).includes(status)) {
            return NextResponse.json({
                error: 'Valid status is required'
            }, { status: 400 });
        }

        const classification = await prisma.classification.findUnique({
            where: { id: params.id },
        });

        if (!classification || classification.userId !== session.user.id) {
            return NextResponse.json({ error: 'Classification not found' }, { status: 404 });
        }

        // Update the status and set appropriate timestamps
        const updateData: any = { status };

        if (status === ClassificationStatus.READY && classification.status === ClassificationStatus.PROCESSING) {
            updateData.processedAt = new Date();
        } else if (status === ClassificationStatus.VALIDATED && classification.status === ClassificationStatus.READY) {
            updateData.validatedAt = new Date();
        } else if (status === ClassificationStatus.DOWNLOADED && classification.status === ClassificationStatus.VALIDATED) {
            updateData.downloadedAt = new Date();
        }

        const updatedClassification = await prisma.classification.update({
            where: { id: params.id },
            data: updateData,
        });

        return NextResponse.json({ classification: updatedClassification });
    } catch (error) {
        console.error('Error updating classification status:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}