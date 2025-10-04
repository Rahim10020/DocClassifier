'use client';

import { useAuth } from '@/hooks/useAuth';

export default function UserMenu() {
    const { user } = useAuth();

    const initials = user?.name
        ? user.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
        : 'U';

    return (
        <div className="glass-card p-1 rounded-full">
            <div className="h-9 w-9 flex items-center justify-center bg-primary text-white rounded-full">
                {user?.image ? (
                    <img src={user.image} alt="Avatar" className="h-full w-full rounded-full" />
                ) : (
                    initials
                )}
            </div>
        </div>
    );
}