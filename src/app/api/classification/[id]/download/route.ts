import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import prisma from '@/lib/db/prisma';
import { ZipGenerator } from '@/lib/storage/zipGenerator';
import { TempStorage } from '@/lib/storage/tempStorage'; // Assume exists
import { getClassificationById } from '@/lib/db/queries/classifications';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const classificationId = params.id;
        const classification = await getClassificationById(classificationId);
        if (!classification || classification.userId !== session.user.id) {
            return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
        }

        if (classification.status !== 'VALIDATED') {
            return NextResponse.json({ error: 'Classification not validated' }, { status: 400 });
        }

        const tempStorage = new TempStorage(session.id); // Assume constructor with sessionId
        const zipStream = await ZipGenerator.generateZip(classification, tempStorage);

        const response = new NextResponse(zipStream as any);
        response.headers.set('Content-Type', 'application/zip');
        response.headers.set('Content-Disposition', `attachment; filename="classification_${classificationId}.zip"`);

        // Update status after stream starts
        zipStream.on('end', async () => {
            setTimeout(async () => {
                try {
                    await prisma.classification.update({
                        where: { id: classificationId },
                        data: { status: 'DOWNLOADED', downloadedAt: new Date() },
                    });
                    tempStorage.cleanup(); // Assume cleanup method
                } catch (err) {
                    console.error('Error updating status or cleaning up:', err);
                }
            }, 5000);
        });

        return response;
    } catch (error) {
        console.error('Error generating ZIP:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}