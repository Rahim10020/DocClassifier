import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import prisma from '@/lib/db/prisma';

// GET /api/categories - List all categories for the authenticated user
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get all unique category paths from documents for this user
        const documents = await prisma.documentMetadata.findMany({
            where: {
                classification: {
                    userId: session.user.id,
                },
                categoryPath: {
                    not: null,
                },
            },
            select: {
                categoryPath: true,
            },
            distinct: ['categoryPath'],
        });

        // Extract and organize categories into a tree structure
        const categories = documents
            .map(doc => doc.categoryPath)
            .filter(Boolean)
            .map(path => {
                const parts = path!.split('/');
                return parts.map((part, index) => ({
                    name: part,
                    path: parts.slice(0, index + 1).join('/'),
                }));
            })
            .flat()
            .filter((category, index, arr) =>
                arr.findIndex(c => c.path === category.path) === index
            )
            .sort((a, b) => a.path.localeCompare(b.path));

        return NextResponse.json({ categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}