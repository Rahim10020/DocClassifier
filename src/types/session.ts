import { Document } from './document';

export interface Session {
    id: string;
    createdAt: Date;
    expiresAt: Date;
    profile?: string;
    language: string;
    totalFiles: number;
    processedFiles: number;
    status: SessionStatus;
    documents?: Document[];
}

export type SessionStatus = 'uploading' | 'processing' | 'extracting' | 'classifying' | 'ready' | 'expired' | 'error';

export interface SessionWithDocuments extends Session {
    documents: Document[];
}

export interface SessionProgress {
    sessionId: string;
    status: SessionStatus;
    totalFiles: number;
    processedFiles: number;
    currentStep: ProcessingStep;
    message?: string;
    error?: string;
}

export interface ProcessingStep {
    name: string;
    status: 'pending' | 'processing' | 'completed' | 'error';
    progress?: number;
    message?: string;
}

export interface SessionCreate {
    profile?: string;
    language?: string;
    files: File[];
}

export interface SessionUpdate {
    sessionId: string;
    documents?: Partial<Document>[];
    status?: SessionStatus;
}

export interface ExportOptions {
    includeReadme: boolean;
    structure: 'flat' | 'hierarchical';
    format: 'zip';
}

export interface DownloadRequest {
    sessionId: string;
    options: ExportOptions;
}