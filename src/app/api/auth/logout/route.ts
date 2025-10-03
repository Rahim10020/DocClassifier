import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';

// POST /api/auth/logout - Logout user
export async function POST() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'No active session' }, { status: 400 });
    }

    // NextAuth handles logout via POST to API route
    // The actual logout logic is handled by NextAuth
    return NextResponse.json({ success: true, message: 'Logged out successfully' });
}