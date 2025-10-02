import { getSession } from 'next-auth/react';

export async function apiClient(endpoint: string, options: RequestInit = {}) {
    const session = await getSession();
    const headers = {
        'Content-Type': 'application/json',
        ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
        ...options.headers,
    };

    const res = await fetch(`/api${endpoint}`, { ...options, headers });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'API error');
    }

    return res.json();
}

// With retry
export async function apiClientWithRetry(endpoint: string, options: RequestInit = {}, attempts = 3) {
    let tryCount = 0;
    while (tryCount < attempts) {
        try {
            return await apiClient(endpoint, options);
        } catch (err) {
            tryCount++;
            if (tryCount === attempts) throw err;
            await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, tryCount)));
        }
    }
}