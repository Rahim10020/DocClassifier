'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema } from '@/lib/validators/profileSchemas';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { z } from 'zod';

type FormData = z.infer<typeof updateProfileSchema>;

interface ProfileFormProps {
    user: {
        image?: string | null;
        id: string;
        email: string;
        name?: string | null;
        password: string;
        createdAt: Date;
        emailVerified?: Date | null;
        updatedAt: Date;
    };
}

export default function ProfileForm({ user }: ProfileFormProps) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            name: user.name || '',
            email: user.email,
        },
    });
    const { toast } = useToast();

    const onSubmit = async (data: FormData) => {
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Update failed');
            toast({ title: 'Succès', description: 'Profil mis à jour' });
        } catch (err) {
            toast({ title: 'Erreur', description: 'Mise à jour échouée', variant: 'destructive' });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center space-x-4">
                <Avatar>
                    <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                    <label>Nom</label>
                    <Input {...register('name')} />
                    {errors.name && <p className="text-red-500">{errors.name.message}</p>}
                </div>
            </div>
            <div>
                <label>Email</label>
                <Input {...register('email')} />
                {errors.email && <p className="text-red-500">{errors.email.message}</p>}
            </div>
            <Button type="submit" disabled={isSubmitting}>Sauvegarder</Button>
        </form>
    );
}