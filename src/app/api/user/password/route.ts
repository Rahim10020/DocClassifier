import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import prisma from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';
import { changePasswordSchema } from '@/lib/validators/profileSchemas';
import { successResponse, errorResponse } from '@/lib/api/apiResponse';
import { handleApiError } from '@/lib/api/errorHandler';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(errorResponse('Unauthorized', 401));
        }

        const body = await req.json();
        const { currentPassword, newPassword } = changePasswordSchema.parse(body);

        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (!user || !user.password) {
            return NextResponse.json(errorResponse('User not found or invalid', 404));
        }

        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) {
            return NextResponse.json(errorResponse('Incorrect current password', 400));
        }

        const hashed = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: session.user.id },
            data: { password: hashed },
        });

        return NextResponse.json(successResponse(null, 'Password changed'));
    } catch (error) {
        return handleApiError(error);
    }
}