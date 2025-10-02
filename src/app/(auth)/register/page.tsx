import { Metadata } from 'next';
import RegisterForm from '@/components/auth/RegisterForm';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

export const metadata: Metadata = {
    title: 'Register - DocClassifier',
};

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background-dark to-background-secondary animate-fade-in">
            <div className="glass-card p-8 rounded-lg shadow-pronounced max-w-md w-full space-y-8">
                <div className="text-center">
                    <img src="/images/logo.svg" alt="DocClassifier" className="mx-auto h-12 w-auto" />
                    <h2 className="mt-6 text-3xl font-bold text-primary">Create a new account</h2>
                </div>
                <RegisterForm />
                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}