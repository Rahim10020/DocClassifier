import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import prisma from '@/lib/db/prisma';
import { getClassificationById } from '@/lib/db/queries/classifications';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const classificationId = params.id;
        const classification = await getClassificationById(classificationId);
        if (!classification || classification.userId !== session.user.id) {
            return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
        }

        if (classification.status !== 'READY') {
            return NextResponse.json({ error: 'Classification not ready' }, { status: 400 });
        }

        await prisma.classification.update({
            where: { id: classificationId },
            data: { status: 'VALIDATED', validatedAt: new Date() },
        });

        const downloadUrl = `/api/classification/${classificationId}/download`;

        return NextResponse.json({ success: true, downloadUrl });
    } catch (error) {
        console.error('Error validating classification:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}