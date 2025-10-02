import { z } from 'zod';

export const updateProfileSchema = z.object({
    name: z.string().min(1, 'Nom requis').optional(),
    email: z.string().email('Email invalide'),
});

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Mot de passe requis'),
        newPassword: z.string().min(8, 'Au moins 8 caractères').regex(/[A-Z]/, 'Au moins une majuscule').regex(/[0-9]/, 'Au moins un chiffre'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Les mots de passe ne correspondent pas',
        path: ['confirmPassword'],
    });