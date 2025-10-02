import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { redirect } from 'next/navigation';

export async function getCurrentSession() {
    return await getServerSession(authOptions);
}

export async function getCurrentUser() {
    const session = await getCurrentSession();
    return session?.user;
}

export async function requireAuth() {
    const session = await getCurrentSession();
    if (!session?.user) {
        redirect('/login');
    }
    return session.user;
}