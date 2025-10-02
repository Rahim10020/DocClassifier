'use client';

import { useSession } from 'next-auth/react';

export function useAuth() {
    const { data: session, status } = useSession();

    const isAuthenticated = !!session?.user;
    const user = session?.user;
    const loading = status === 'loading';

    return { isAuthenticated, user, loading };
}