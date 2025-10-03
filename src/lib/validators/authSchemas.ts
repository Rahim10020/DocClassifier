import { z } from 'zod';

export const registerSchema = z
    .object({
        email: z.string().email('Invalid email address'),
        name: z.string().min(1, 'Name is required').optional(),
        password: z.string().min(1, 'Password is required'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

export type RegisterFormData = z.infer<typeof registerSchema>;

export type LoginFormData = z.infer<typeof loginSchema>;

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});