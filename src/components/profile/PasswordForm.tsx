'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema } from '@/lib/validators/profileSchemas';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { z } from 'zod';

type FormData = z.infer<typeof changePasswordSchema>;

export default function PasswordForm() {
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
        resolver: zodResolver(changePasswordSchema),
    });
    const { toast } = useToast();

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

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label>Ancien mot de passe</label>
                <Input type="password" {...register('currentPassword')} />
                {errors.currentPassword && <p className="text-red-500">{errors.currentPassword.message}</p>}
            </div>
            <div>
                <label>Nouveau mot de passe</label>
                <Input type="password" {...register('newPassword')} />
                {errors.newPassword && <p className="text-red-500">{errors.newPassword.message}</p>}
            </div>
            <div>
                <label>Confirmation</label>
                <Input type="password" {...register('confirmPassword')} />
                {errors.confirmPassword && <p className="text-red-500">{errors.confirmPassword.message}</p>}
            </div>
            <Button type="submit" disabled={isSubmitting}>Changer</Button>
        </form>
    );
}