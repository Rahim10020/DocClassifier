import { z } from 'zod';

export const idSchema = z.string().cuid({ message: 'ID invalide' });

export const emailSchema = z.string().email({ message: 'Email invalide' });

export const passwordSchema = z
    .string()
    .min(8, 'Mot de passe trop court (min 8 caractères)')
    .regex(/[A-Z]/, 'Doit contenir au moins une majuscule')
    .regex(/[0-9]/, 'Doit contenir au moins un chiffre');

export const dateSchema = z.date();

export const paginationSchema = z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(10),
});