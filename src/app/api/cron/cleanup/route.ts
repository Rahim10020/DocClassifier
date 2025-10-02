import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { TempStorage } from '@/lib/storage/tempStorage';
import { logger } from '@/lib/utils/logger';
import { getExpiredClassifications, updateStatusToExpired } from '@/lib/db/queries/classifications';

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
                const tempStorage = new TempStorage(classification.userId); // Assume userId for temp path
                await tempStorage.cleanup(classification.id); // Assume cleanup accepts classificationId
                await updateStatusToExpired([classification.id]);
                logger('info', `Cleaned up expired classification`, { id: classification.id });
                cleaned++;
            } catch (err) {
                const errorMsg = (err as Error).message;
                errors.push(`Failed to clean ${classification.id}: ${errorMsg}`);
                logger('error', 'Error cleaning classification', { id: classification.id, error: errorMsg });
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