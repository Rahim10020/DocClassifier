import { z } from 'zod';

export const sessionCreateSchema = z.object({
    profile: z.enum(['student', 'professional', 'researcher', 'personal', 'auto']).optional(),
    language: z.enum(['fr', 'en']).default('fr'),
});

export const sessionUpdateSchema = z.object({
    sessionId: z.string().cuid(),
    documents: z.array(z.object({
        id: z.string().cuid(),
        mainCategory: z.string().optional(),
        subCategory: z.string().optional(),
        confidence: z.number().min(0).max(1).optional(),
    })).optional(),
    status: z.enum(['uploading', 'processing', 'extracting', 'classifying', 'ready', 'expired', 'error']).optional(),
});

export const documentUpdateSchema = z.object({
    id: z.string().cuid(),
    mainCategory: z.string().optional(),
    subCategory: z.string().optional(),
});

export const downloadRequestSchema = z.object({
    sessionId: z.string().cuid(),
    options: z.object({
        includeReadme: z.boolean().default(true),
        structure: z.enum(['flat', 'hierarchical']).default('hierarchical'),
        format: z.literal('zip').default('zip'),
    }),
});

export type SessionCreateInput = z.infer<typeof sessionCreateSchema>;
export type SessionUpdateInput = z.infer<typeof sessionUpdateSchema>;
export type DocumentUpdateInput = z.infer<typeof documentUpdateSchema>;
export type DownloadRequestInput = z.infer<typeof downloadRequestSchema>;

export function validateSessionId(sessionId: string): boolean {
    return z.string().cuid().safeParse(sessionId).success;
}

export function validateDocumentId(documentId: string): boolean {
    return z.string().cuid().safeParse(documentId).success;
}