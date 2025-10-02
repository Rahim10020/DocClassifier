import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';

export async function middleware(request: NextRequest) {
    const session = await getServerSession(authOptions);

    const protectedPaths = [
        '/dashboard',
        '/upload',
        '/review',
        '/history',
        '/profile',
    ];

    const isProtected = protectedPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path)
    );

    if (isProtected && !session?.user) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('callbackUrl', request.nextUrl.pathname);
        return NextResponse.redirect(url);
    }

    // Allow /api/auth/* without auth
    if (request.nextUrl.pathname.startsWith('/api/auth')) {
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};