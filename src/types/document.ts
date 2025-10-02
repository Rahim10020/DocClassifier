import { Prisma } from '@prisma/client';

// Base DocumentMetadata type from Prisma
export type DocumentMetadata = {
    id: string;
    classificationId: string;
    originalName: string;
    filename: string;
    fileSize: number;
    mimeType: string;
    categoryName?: string | null;
    categoryPath?: string | null;
    confidence?: number | null;
    extractedText?: string | null;
    createdAt: Date;
};

// Interface for uploaded file (pre-processing)
export interface UploadedFile {
    originalName: string;
    filename: string; // Temp filename in /tmp
    fileSize: number;
    mimeType: string;
    status?: 'pending' | 'uploading' | 'completed' | 'error';
    progress?: number;
}

// Interface for file info during processing
export interface FileInfo extends UploadedFile {
    extractedText?: string;
    confidence?: number;
    categoryName?: string;
    categoryPath?: string;
}

// Document creation input
export interface DocumentMetadataCreateInput
    extends Omit<DocumentMetadata, 'id' | 'createdAt'> { }

// Main Document interface for UI components
export interface Document {
    id: string;
    name: string;
    categoryId?: string;
    confidence?: number;
    status: 'pending' | 'classified' | 'reviewed';
    createdAt: Date;
    updatedAt: Date;
    metadata?: DocumentMetadata;
}