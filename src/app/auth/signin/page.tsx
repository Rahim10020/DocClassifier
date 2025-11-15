'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { Loader2, Mail, Lock } from 'lucide-react';

export default function SignInPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCredentialsSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Email ou mot de passe incorrect');
            } else {
                router.push('/dashboard');
            }
        } catch (err) {
            setError('Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOAuthSignIn = async (provider: 'google' | 'github') => {
        setIsLoading(true);
        await signIn(provider, { callbackUrl: '/dashboard' });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-light to-background p-6">
            <Card className="w-full max-w-md p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        Connexion
                    </h1>
                    <p className="text-foreground-muted">
                        Connectez-vous pour accéder à vos documents
                    </p>
                </div>

                {/* OAuth Providers */}
                <div className="space-y-3 mb-6">
                    <Button
                        onClick={() => handleOAuthSignIn('google')}
                        variant="outline"
                        className="w-full gap-3 h-12"
                        disabled={isLoading}
                    >
                        <FcGoogle className="h-5 w-5" />
                        Continuer avec Google
                    </Button>

                    <Button
                        onClick={() => handleOAuthSignIn('github')}
                        variant="outline"
                        className="w-full gap-3 h-12"
                        disabled={isLoading}
                    >
                        <FaGithub className="h-5 w-5" />
                        Continuer avec GitHub
                    </Button>
                </div>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-card text-foreground-muted">
                            Ou avec email
                        </span>
                    </div>
                </div>

                {/* Credentials Form */}
                <form onSubmit={handleCredentialsSignIn} className="space-y-4">
                    {error && (
                        <div className="p-3 rounded-lg bg-error-light text-error text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10"
                                placeholder="votre@email.com"
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Mot de passe
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10"
                                placeholder="••••••••"
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                Connexion...
                            </>
                        ) : (
                            'Se connecter'
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-foreground-muted">
                    Pas encore de compte ?{' '}
                    <Link href="/auth/signup" className="text-primary hover:underline font-medium">
                        Créer un compte
                    </Link>
                </div>

                <div className="mt-4 text-center">
                    <Link href="/" className="text-sm text-foreground-muted hover:text-primary">
                        ← Retour à l&apos;accueil
                    </Link>
                </div>
            </Card>
        </div>
    );
}
