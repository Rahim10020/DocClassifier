import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import prisma from '@/lib/db/prisma';
import { ClassificationStatus } from '@/types/classification';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 10;
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where = {
        userId: session.user.id,
        ...(status && status !== 'all' ? { status: status as ClassificationStatus } : {}),
        ...(search ? { name: { contains: search } } : {}), // Adjust for file names if needed
    };

    try {
        const [classifications, total] = await Promise.all([
            prisma.classification.findMany({
                where,
                take: limit,
                skip: (page - 1) * limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.classification.count({ where }),
        ]);

        return NextResponse.json({
            classifications,
            total,
            page,
            pages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Error fetching classifications:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}