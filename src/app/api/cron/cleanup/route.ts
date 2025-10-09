import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { TempStorage } from '@/lib/storage/tempStorage';
import { logger } from '@/lib/utils/logger';
import { getExpiredClassifications, updateStatusToExpired, getClassificationsByUserId } from '@/lib/db/queries/classifications';

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        logger('error', 'Unauthorized access to CRON endpoint', { authHeader });
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const expired = await getExpiredClassifications();
        const errors: string[] = [];
        let cleaned = 0;

        for (const classification of expired) {
            try {
                const tempStorage = new TempStorage(classification.sessionId);
                await tempStorage.cleanup(classification.id);
                await updateStatusToExpired(classification.id);
                logger('info', `Cleaned up expired classification`, { id: classification.id });
                cleaned++;
            } catch (err) {
                const errorMsg = (err as Error).message;
                errors.push(`Failed to clean ${classification.id}: ${errorMsg}`);
                logger('error', 'Error cleaning classification', { id: classification.id, error: errorMsg });
            }
        }

        // Check for stuck classifications (PROCESSING for more than 10 minutes)
        const stuckClassifications = await prisma.classification.findMany({
            where: {
                status: 'PROCESSING',
                createdAt: {
                    lt: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
                }
            }
        });

        for (const classification of stuckClassifications) {
            try {
                // Mark stuck classifications as READY so they stop causing infinite polling
                await prisma.classification.update({
                    where: { id: classification.id },
                    data: { status: 'READY' }
                });
                logger('warn', `Marked stuck classification as READY`, { id: classification.id });
                cleaned++;
            } catch (err) {
                const errorMsg = (err as Error).message;
                errors.push(`Failed to fix stuck classification ${classification.id}: ${errorMsg}`);
                logger('error', 'Error fixing stuck classification', { id: classification.id, error: errorMsg });
            }
        }

        logger('info', 'CRON cleanup completed', { cleaned, errors: errors.length });
        return NextResponse.json({ cleaned, errors });
    } catch (error) {
        const errorMsg = (error as Error).message;
        logger('error', 'CRON cleanup failed', { error: errorMsg });
        return NextResponse.json({ error: 'Internal server error', details: errorMsg }, { status: 500 });
    }
}