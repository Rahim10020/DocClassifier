import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import prisma from '@/lib/db/prisma';

// Export function for use in other parts of the app
export async function getStats(userId: string) {
    try {
        const total = await prisma.classification.count({ where: { userId } });
        const totalDocuments = await prisma.document.count({ where: { classification: { userId } } });
        const thisMonth = await prisma.classification.count({
            where: { userId, createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
        });
        const downloaded = await prisma.classification.count({ where: { userId, status: 'DOWNLOADED' } });
        const successRate = total ? Math.round((downloaded / total) * 100) : 0;

        return {
            total,
            thisMonth,
            successRate,
            totalDocuments,
            trendTotal: 0, // TODO: Calculate trends
            trendThisMonth: 0,
            trendSuccess: 0,
            trendDocuments: 0,
        };
    } catch (error) {
        console.error('Error getting stats:', error);
        throw new Error('Failed to get stats');
    }
}

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const total = await prisma.classification.count({ where: { userId: session.user.id } });
        const totalDocuments = await prisma.document.count({ where: { classification: { userId: session.user.id } } });
        const thisMonth = await prisma.classification.count({
            where: { userId: session.user.id, createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
        });
        const downloaded = await prisma.classification.count({ where: { userId: session.user.id, status: 'DOWNLOADED' } });
        const successRate = total ? Math.round((downloaded / total) * 100) : 0;

        // Top categories - assume aggregation

        return NextResponse.json({
            total,
            thisMonth,
            successRate,
            totalDocuments,
            // trends, topCategories
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}