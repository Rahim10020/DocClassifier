import { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Login - DocClassifier',
};

export default function LoginPage() {
    return (
        <div className="flex items-center justify-center p-4">
            <div className="glass-card p-8 rounded-lg shadow-pronounced max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold text-primary">Sign in</h2>
                </div>
                <LoginForm />
                <p className="text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="text-primary hover:underline">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}