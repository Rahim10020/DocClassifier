'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '@/lib/validators/authSchemas';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export default function RegisterForm() {
    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const onSubmit = async (data: RegisterFormData) => {
        setLoading(true);
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        setLoading(false);

        if (!response.ok) {
            const error = await response.json();
            toast({ title: 'Error', description: error.error, variant: 'destructive' });
        } else {
            toast({ title: 'Success', description: 'Account created! Please sign in.' });
            window.location.href = '/login';
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
                <Label htmlFor="name">Name (optional)</Label>
                <Input id="name" type="text" {...register('name')} className="mt-1" />
                {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>}
            </div>
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
            <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" {...register('confirmPassword')} className="mt-1" />
                {errors.confirmPassword && <p className="mt-1 text-sm text-destructive">{errors.confirmPassword.message}</p>}
            </div>
            <Button type="submit" disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Register
            </Button>
        </form>
    );
}