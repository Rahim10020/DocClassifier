import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import prisma from '@/lib/db/prisma';
import { updateProfileSchema } from '@/lib/validators/profileSchemas';
import { successResponse, errorResponse } from '@/lib/api/apiResponse';
import { handleApiError } from '@/lib/api/errorHandler';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(errorResponse('Unauthorized', 401));
        }

        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (!user) {
            return NextResponse.json(errorResponse('User not found', 404));
        }

        return NextResponse.json(successResponse(user));
    } catch (error) {
        return handleApiError(error);
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(errorResponse('Unauthorized', 401));
        }

        const body = await req.json();
        const data = updateProfileSchema.parse(body);

        // Check email unique if changed
        if (data.email !== session.user.email) {
            const existing = await prisma.user.findUnique({ where: { email: data.email } });
            if (existing) {
                return NextResponse.json(errorResponse('Email already in use', 400));
            }
        }

        const updated = await prisma.user.update({
            where: { id: session.user.id },
            data,
        });

        return NextResponse.json(successResponse(updated, 'Profile updated'));
    } catch (error) {
        return handleApiError(error);
    }
}