'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Protected route component that requires authentication
 */

interface ProtectedRouteProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    redirectTo?: string;
    requiredRole?: string;
}

export function ProtectedRoute({
    children,
    fallback,
    redirectTo = '/login',
    requiredRole,
}: ProtectedRouteProps) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isRedirecting, setIsRedirecting] = React.useState(false);

    React.useEffect(() => {
        if (status === 'loading') return; // Still loading

        if (status === 'unauthenticated') {
            setIsRedirecting(true);
            router.push(`${redirectTo}?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        // Role check would need to be implemented based on your user model
        // For now, we'll skip role-based access control
        // if (requiredRole && session?.user?.role !== requiredRole) {
        //     setIsRedirecting(true);
        //     router.push('/unauthorized');
        //     return;
        // }
    }, [status, session, router, redirectTo, requiredRole]);

    // Show loading spinner while checking authentication
    if (status === 'loading' || isRedirecting) {
        if (fallback) {
            return <>{fallback}</>;
        }

        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6">
                        <div className="flex flex-col items-center space-y-4">
                            <LoadingSpinner size={48} className="text-primary" />
                            <div className="text-center">
                                <h3 className="text-lg font-semibold">Loading...</h3>
                                <p className="text-sm text-muted-foreground">
                                    Please wait while we verify your authentication
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Role-based access control would be implemented here
    // For now, we'll allow all authenticated users

    // User is authenticated and authorized
    return <>{children}</>;
}

/**
 * Admin-only protected route
 */
interface AdminProtectedRouteProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function AdminProtectedRoute({
    children,
    fallback,
}: AdminProtectedRouteProps) {
    return (
        <ProtectedRoute
            requiredRole="admin"
            fallback={fallback}
        >
            {children}
        </ProtectedRoute>
    );
}

/**
 * Role-based access control hook
 */
export function useRoleAccess() {
    const { data: session } = useSession();

    const hasRole = React.useCallback((role: string) => {
        // Role-based access control would be implemented based on your user model
        // For now, we'll return true for authenticated users
        return !!session?.user;
    }, [session]);

    const hasAnyRole = React.useCallback((roles: string[]) => {
        // Role-based access control would be implemented based on your user model
        return !!session?.user;
    }, [session]);

    const isAdmin = React.useCallback(() => {
        // Role-based access control would be implemented based on your user model
        return !!session?.user;
    }, [session]);

    const isUser = React.useCallback(() => {
        return !!session?.user;
    }, [session]);

    return {
        user: session?.user,
        role: 'user', // Default role for now
        hasRole,
        hasAnyRole,
        isAdmin,
        isUser,
    };
}

/**
 * Permission-based component wrapper
 */
interface PermissionGuardProps {
    children: React.ReactNode;
    permissions: string[];
    requireAll?: boolean; // true = need all permissions, false = need any permission
    fallback?: React.ReactNode;
}

export function PermissionGuard({
    children,
    permissions,
    requireAll = false,
    fallback,
}: PermissionGuardProps) {
    const { data: session } = useSession();
    const { hasAnyRole, hasRole } = useRoleAccess();

    // Simple permission check for authenticated users
    // In a real app, you'd have a more sophisticated permission system
    const userPermissions = React.useMemo(() => {
        return session?.user ? ['read', 'write'] : [];
    }, [session?.user]);

    const hasAccess = React.useMemo(() => {
        if (requireAll) {
            return permissions.every(permission => userPermissions.includes(permission));
        } else {
            return permissions.some(permission => userPermissions.includes(permission));
        }
    }, [permissions, userPermissions, requireAll]);

    if (!hasAccess) {
        return fallback || (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Access Denied
                    </h3>
                    <p className="text-sm text-gray-600">
                        You don't have permission to view this content.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

/**
 * Guest route component (redirects authenticated users)
 */
interface GuestRouteProps {
    children: React.ReactNode;
    redirectTo?: string;
}

export function GuestRoute({
    children,
    redirectTo = '/dashboard',
}: GuestRouteProps) {
    const { data: session, status } = useSession();
    const router = useRouter();

    React.useEffect(() => {
        if (status === 'authenticated') {
            router.push(redirectTo);
        }
    }, [status, router, redirectTo]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size={48} />
            </div>
        );
    }

    if (status === 'authenticated') {
        return null; // Will redirect
    }

    return <>{children}</>;
}