import { z } from 'zod';
import { ClassificationStatus } from '@/types/classification';

// Define the category structure schema first
const categoryStructureSchema: z.ZodType<any> = z.object({
    name: z.string().min(1, 'Category name is required'),
    path: z.string().min(1, 'Category path is required'),
    children: z.array(z.lazy(() => categoryStructureSchema)).optional(),
});

// Schema for creating a new classification
export const classificationCreateSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    sessionId: z.string().min(1, 'Session ID is required'),
    proposedStructure: z.array(categoryStructureSchema).min(1, 'At least one category is required'),
    totalDocuments: z.number().int().min(0, 'Total documents must be non-negative'),
    totalSize: z.number().int().min(0, 'Total size must be non-negative'),
});

export type ClassificationCreateInput = z.infer<typeof classificationCreateSchema>;

// Schema for updating classification status
export const classificationStatusSchema = z.object({
    status: z.nativeEnum(ClassificationStatus),
});

export type ClassificationStatusInput = z.infer<typeof classificationStatusSchema>;

// Schema for updating classification structure
export const classificationStructureSchema = z.object({
    finalStructure: z.array(categoryStructureSchema).min(1, 'At least one category is required'),
});

export type ClassificationStructureInput = z.infer<typeof classificationStructureSchema>;

// Schema for classification filters
export const classificationFilterSchema = z.object({
    status: z.nativeEnum(ClassificationStatus).optional(),
    userId: z.string().optional(),
    limit: z.number().int().min(1).max(100).default(20),
    offset: z.number().int().min(0).default(0),
    search: z.string().optional(),
});

export type ClassificationFilterInput = z.infer<typeof classificationFilterSchema>;

// Schema for document classification update
export const documentClassificationSchema = z.object({
    documentId: z.string().min(1, 'Document ID is required'),
    categoryName: z.string().min(1, 'Category name is required'),
    categoryPath: z.string().min(1, 'Category path is required'),
    confidence: z.number().min(0).max(1).optional(),
});

export type DocumentClassificationInput = z.infer<typeof documentClassificationSchema>;