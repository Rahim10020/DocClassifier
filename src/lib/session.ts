import { prisma } from './prisma';
import { Session, SessionStatus } from '@/types/session';
import { calculateSessionExpiry } from './utils';

const SESSION_DURATION_HOURS = parseInt(process.env.SESSION_DURATION_HOURS || '2');

export async function createSession(
    profile?: string,
    language: string = 'fr'
): Promise<Session> {
    const expiresAt = calculateSessionExpiry(SESSION_DURATION_HOURS);

    const session = await prisma.classificationSession.create({
        data: {
            profile,
            language,
            expiresAt,
            status: 'uploading',
        },
    });

    return session as unknown as Session;
}

export async function getSession(sessionId: string): Promise<Session | null> {
    const session = await prisma.classificationSession.findUnique({
        where: { id: sessionId },
        include: {
            documents: true,
        },
    });

    if (!session) return null;

    // Vérifier l'expiration
    if (new Date(session.expiresAt) < new Date()) {
        await updateSessionStatus(sessionId, 'expired');
        return { ...session, status: 'expired' as SessionStatus } as unknown as Session;
    }

    return session as unknown as Session;
}

export async function updateSessionStatus(
    sessionId: string,
    status: SessionStatus
): Promise<void> {
    await prisma.classificationSession.update({
        where: { id: sessionId },
        data: { status },
    });
}

export async function updateSessionProgress(
    sessionId: string,
    processedFiles: number
): Promise<void> {
    await prisma.classificationSession.update({
        where: { id: sessionId },
        data: { processedFiles },
    });
}

export async function incrementProcessedFiles(sessionId: string): Promise<number> {
    const session = await prisma.classificationSession.update({
        where: { id: sessionId },
        data: {
            processedFiles: {
                increment: 1,
            },
        },
    });

    return session.processedFiles;
}

export async function deleteSession(sessionId: string): Promise<void> {
    await prisma.classificationSession.delete({
        where: { id: sessionId },
    });
}

export async function cleanupExpiredSessions(): Promise<number> {
    const result = await prisma.classificationSession.deleteMany({
        where: {
            expiresAt: {
                lt: new Date(),
            },
        },
    });

    return result.count;
}

export async function getSessionDocuments(sessionId: string) {
    return await prisma.document.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' },
    });
}

export async function updateSessionTotalFiles(
    sessionId: string,
    totalFiles: number
): Promise<void> {
    await prisma.classificationSession.update({
        where: { id: sessionId },
        data: { totalFiles },
    });
}