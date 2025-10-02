import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { sourceId, targetId, classificationId } = body;

    try {
        await prisma.$transaction(async (tx) => {
            // Move documents
            await tx.document.updateMany({
                where: { categoryId: sourceId },
                data: { categoryId: targetId },
            });
            // Delete source category
            await tx.category.delete({ where: { id: sourceId } });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error merging categories:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}