import prisma from '@/lib/db/prisma';

// Define the Classification type based on Prisma schema
type Classification = {
    id: string;
    userId: string;
    sessionId: string;
    status: 'PROCESSING' | 'READY' | 'VALIDATED' | 'DOWNLOADED' | 'EXPIRED';
    proposedStructure: any;
    finalStructure?: any;
    totalDocuments: number;
    totalSize: bigint;
    createdAt: Date;
    processedAt?: Date;
    validatedAt?: Date;
    downloadedAt?: Date;
    expiresAt?: Date;
};

/**
 * Gets a classification by ID.
 * @param id - Classification ID.
 * @returns The classification or null.
 * @throws Error on DB failure.
 */
export async function getClassificationById(id: string): Promise<Classification | null> {
    try {
        return await prisma.classification.findUnique({ where: { id } });
    } catch (error) {
        console.error('Error fetching classification:', error);
        throw new Error('Database query failed.');
    }
}

/**
 * Updates a classification.
 * @param id - Classification ID.
 * @param data - Data to update.
 * @returns Updated classification.
 * @throws Error on DB failure.
 */
export async function updateClassification(id: string, data: Partial<Classification>): Promise<Classification> {
    try {
        return await prisma.classification.update({ where: { id }, data });
    } catch (error) {
        console.error('Error updating classification:', error);
        throw new Error('Database update failed.');
    }
}

/**
 * Gets classifications by user ID.
 * @param userId - User ID.
 * @returns Array of classifications.
 * @throws Error on DB failure.
 */
export async function getClassificationsByUserId(userId: string): Promise<Classification[]> {
    try {
        return await prisma.classification.findMany({ where: { userId } });
    } catch (error) {
        console.error('Error fetching user classifications:', error);
        throw new Error('Database query failed.');
    }
}

/**
 * Gets expired classifications for cleanup.
 * @returns Array of expired classifications.
 * @throws Error on DB failure.
 */
export async function getExpiredClassifications(): Promise<Classification[]> {
    try {
        return await prisma.classification.findMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
                status: {
                    not: 'DOWNLOADED', // Don't cleanup downloaded classifications
                },
            },
        });
    } catch (error) {
        console.error('Error fetching expired classifications:', error);
        throw new Error('Database query failed.');
    }
}

/**
 * Updates classification status to expired.
 * @param id - Classification ID.
 * @returns Updated classification.
 * @throws Error on DB failure.
 */
export async function updateStatusToExpired(id: string): Promise<Classification> {
    try {
        return await prisma.classification.update({
            where: { id },
            data: { status: 'EXPIRED' },
        });
    } catch (error) {
        console.error('Error updating classification status to expired:', error);
        throw new Error('Database update failed.');
    }
}