'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/lib/validators/authSchemas';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function LoginForm() {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data: LoginFormData) => {
        setLoading(true);
        const result = await signIn('credentials', {
            redirect: false,
            email: data.email,
            password: data.password,
        });

        setLoading(false);

        if (result?.error) {
            toast.error(result.error);
        } else {
            window.location.href = '/dashboard';
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" {...register('email')} className="mt-1" />
                {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...register('password')} className="mt-1" />
                {errors.password && <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sign in
            </Button>
        </form>
    );
}