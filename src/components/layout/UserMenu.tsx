'use client';

import { signOut } from 'next-auth/react';
import { useAuth } from '@/hooks/useAuth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

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
        <DropdownMenu>
            <DropdownMenuTrigger className="glass-card p-1 rounded-full">
                <div className="h-8 w-8 flex items-center justify-center bg-primary text-white rounded-full">
                    {user?.image ? (
                        <img src={user.image} alt="Avatar" className="h-full w-full rounded-full" />
                    ) : (
                        initials
                    )}
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-card w-56">
                <DropdownMenuLabel>
                    <div className="flex flex-col">
                        <span>{user?.name || 'User'}</span>
                        <span className="text-sm text-muted-foreground">{user?.email}</span>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <a href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                    </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <a href="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}