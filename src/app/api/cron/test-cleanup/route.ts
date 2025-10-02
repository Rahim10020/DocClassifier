import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';
import { getExpiredClassifications, updateStatusToExpired } from '@/lib/db/queries/classifications';
import { TempStorage } from '@/lib/storage/tempStorage';

export async function GET(req: NextRequest) {
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Only available in development' }, { status: 403 });
    }

    // Same logic as cleanup/route.ts
    try {
        const expired = await getExpiredClassifications();
        const errors: string[] = [];
        let cleaned = 0;

        for (const classification of expired) {
            try {
                const tempStorage = new TempStorage(classification.userId);
                await tempStorage.cleanup(classification.id);
                await updateStatusToExpired([classification.id]);
                logger('info', `Test cleaned up expired classification`, { id: classification.id });
                cleaned++;
            } catch (err) {
                const errorMsg = (err as Error).message;
                errors.push(`Failed to clean ${classification.id}: ${errorMsg}`);
                logger('error', 'Error in test cleanup', { id: classification.id, error: errorMsg });
            }
        }

        logger('info', 'Test CRON cleanup completed', { cleaned, errors: errors.length });
        return NextResponse.json({ cleaned, errors });
    } catch (error) {
        const errorMsg = (error as Error).message;
        logger('error', 'Test CRON cleanup failed', { error: errorMsg });
        return NextResponse.json({ error: 'Internal server error', details: errorMsg }, { status: 500 });
    }
}