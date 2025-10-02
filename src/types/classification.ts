import { Prisma } from '@prisma/client';
import type { DocumentMetadata } from './document';

// Enum mirroring Prisma's ClassificationStatus
export enum ClassificationStatus {
    PROCESSING = 'PROCESSING',
    READY = 'READY',
    VALIDATED = 'VALIDATED',
    DOWNLOADED = 'DOWNLOADED',
    EXPIRED = 'EXPIRED',
}

// Base Classification type from Prisma
export type Classification = Prisma.ClassificationGetPayload<{}>;

// Classification with included documents
export type ClassificationWithDocuments = Prisma.ClassificationGetPayload<{
    include: { documents: true };
}>;

// Interface for proposed/final structure (JSON tree in DB)
// Represents a hierarchical category structure
export interface CategoryStructure {
    name: string;
    path: string;
    children?: CategoryStructure[]; // Recursive for subcategories
    documents?: DocumentMetadata[]; // Attached documents
}

// Typed proposed structure
export type ProposedStructure = CategoryStructure[];

// Typed final structure
export type FinalStructure = CategoryStructure[];

// Classification creation input
export interface ClassificationCreateInput
    extends Omit<Classification, 'id' | 'createdAt' | 'processedAt' | 'validatedAt' | 'downloadedAt' | 'expiresAt'> {
    proposedStructure: ProposedStructure; // JSON serialized in DB
}