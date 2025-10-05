import { Metadata } from 'next';
import RegisterForm from '@/components/auth/RegisterForm';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Register - DocClassifier',
};

export default function RegisterPage() {
    return (
        <div className="flex items-center justify-center">
            <div className="p-5 rounded-lg shadow-pronounced max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold text-primary">Create a new account</h2>
                </div>
                <RegisterForm />
                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}