import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import prisma from '@/lib/db/prisma';
import { TempStorage } from '@/lib/storage/tempStorage';
import { signOut } from 'next-auth/react'; // Server-side equivalent
import { successResponse, errorResponse } from '@/lib/api/apiResponse';
import { handleApiError } from '@/lib/api/errorHandler';

export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(errorResponse('Unauthorized', 401));
        }

        // Delete classifications
        await prisma.classification.deleteMany({ where: { userId: session.user.id } });

        // Cleanup temp
        const tempStorage = new TempStorage(session.user.id);
        await tempStorage.cleanup();

        // Delete user
        await prisma.user.delete({ where: { id: session.user.id } });

        // Logout - on server, redirect or something
        // For API, return success and client handles logout

        return NextResponse.json(successResponse(null, 'Account deleted'));
    } catch (error) {
        return handleApiError(error);
    }
}