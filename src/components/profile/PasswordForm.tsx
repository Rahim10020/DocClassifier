'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema } from '@/lib/validators/profileSchemas';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';

type FormData = z.infer<typeof changePasswordSchema>;

export default function PasswordForm() {
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
        resolver: zodResolver(changePasswordSchema),
    });
    const { toast } = useToast();

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const onSubmit = async (data: FormData) => {
        try {
            const res = await fetch('/api/user/password', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Password change failed');
            toast({ title: 'Succès', description: 'Mot de passe changé' });
            reset();
        } catch (err) {
            toast({ title: 'Erreur', description: 'Changement échoué', variant: 'destructive' });
        }
    };

    const PasswordInput = ({ label, field, registerField, error }: {
        label: string;
        field: 'current' | 'new' | 'confirm';
        registerField: any;
        error?: any;
    }) => (
        <div>
            <label>{label}</label>
            <div className="relative">
                <Input
                    type={showPasswords[field] ? "text" : "password"}
                    {...registerField}
                    className="pr-10"
                />
                <button
                    type="button"
                    onClick={() => togglePasswordVisibility(field)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                    {showPasswords[field] ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                    )}
                </button>
            </div>
            {error && <p className="text-red-500">{error.message}</p>}
        </div>
    );

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <PasswordInput
                label="Ancien mot de passe"
                field="current"
                registerField={register('currentPassword')}
                error={errors.currentPassword}
            />
            <PasswordInput
                label="Nouveau mot de passe"
                field="new"
                registerField={register('newPassword')}
                error={errors.newPassword}
            />
            <PasswordInput
                label="Confirmation"
                field="confirm"
                registerField={register('confirmPassword')}
                error={errors.confirmPassword}
            />
            <Button type="submit" disabled={isSubmitting}>Changer</Button>
        </form>
    );
}