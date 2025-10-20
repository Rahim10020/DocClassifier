import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import prisma from '@/lib/db/prisma';

// GET /api/categories/[id] - Get documents in a specific category
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const categoryPath = decodeURIComponent(params.id);

        // Get all documents in this category path for the authenticated user
        const documents = await prisma.documentMetadata.findMany({
            where: {
                categoryPath: categoryPath,
                classification: {
                    userId: session.user.id,
                },
            },
            include: {
                classification: {
                    select: {
                        id: true,
                        status: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Get category statistics
        const stats = await prisma.documentMetadata.aggregate({
            where: {
                categoryPath: categoryPath,
                classification: {
                    userId: session.user.id,
                },
            },
            _count: true,
            _sum: {
                fileSize: true,
            },
        });

        return NextResponse.json({
            category: {
                path: categoryPath,
                documents,
                stats: {
                    totalDocuments: stats._count,
                    totalSize: stats._sum.fileSize || 0,
                },
            },
        });
    } catch (error) {
        console.error('Error fetching category:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}