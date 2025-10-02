import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import prisma from '@/lib/db/prisma';
import { TempStorage } from '@/lib/storage/tempStorage'; // Assume

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const classification = await prisma.classification.findUnique({
            where: { id: params.id },
            include: { documents: true },
        });
        if (!classification || classification.userId !== session.user.id) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        return NextResponse.json(classification);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const classification = await prisma.classification.findUnique({ where: { id: params.id } });
        if (!classification || classification.userId !== session.user.id) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        await prisma.classification.delete({ where: { id: params.id } });
        // Cleanup temp
        const tempStorage = new TempStorage(session.id);
        tempStorage.cleanupClassification(params.id); // Assume method

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}