import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import prisma from '@/lib/db/prisma';

// GET /api/categories/suggest - Suggest category names based on document content
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 20);

    if (!query || query.length < 2) {
        return NextResponse.json({ suggestions: [] });
    }

    try {
        // Get existing category suggestions based on document content and existing categories
        const documents = await prisma.documentMetadata.findMany({
            where: {
                classification: {
                    userId: session.user.id,
                },
                AND: [
                    {
                        OR: [
                            { originalName: { contains: query, mode: 'insensitive' } },
                            { extractedText: { contains: query, mode: 'insensitive' } },
                        ],
                    },
                ],
            },
            select: {
                categoryPath: true,
                originalName: true,
            },
            take: limit * 2, // Get more to process
        });

        // Extract unique category suggestions
        const suggestions = new Set<string>();
        documents.forEach(doc => {
            if (doc.categoryPath) {
                suggestions.add(doc.categoryPath);
            }
            // Also suggest based on filename patterns
            const nameParts = doc.originalName.toLowerCase().split(/[-_\s]+/);
            nameParts.forEach(part => {
                if (part.length > 2 && part.includes(query.toLowerCase())) {
                    suggestions.add(part);
                }
            });
        });

        // Convert to array and limit results
        const result = Array.from(suggestions)
            .filter(suggestion => suggestion.toLowerCase().includes(query.toLowerCase()))
            .slice(0, limit);

        return NextResponse.json({ suggestions: result });
    } catch (error) {
        console.error('Error getting category suggestions:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}