export interface Document {
    id: string;
    sessionId: string;
    originalName: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    filePath: string;
    extractedText?: string;
    language?: string;
    mainCategory?: string;
    subCategory?: string;
    confidence?: number;
    keywords: string[];
    pageCount?: number;
    wordCount?: number;
    createdAt: Date;
}

export interface DocumentUpload {
    file: File;
    id: string;
    name: string;
    size: number;
    type: string;
    status: 'pending' | 'uploading' | 'uploaded' | 'error';
    progress?: number;
    error?: string;
}

export interface DocumentExtraction {
    documentId: string;
    text: string;
    language: string;
    pageCount?: number;
    wordCount?: number;
    metadata?: Record<string, unknown>;
}

export interface DocumentClassification {
    documentId: string;
    mainCategory: string;
    subCategory?: string;
    confidence: number;
    keywords: string[];
    alternativeCategories?: AlternativeCategory[];
}

export interface AlternativeCategory {
    categoryId: string;
    categoryName: string;
    subCategory?: string;
    score: number;
    matchedKeywords: string[];
}

export interface DocumentPreview {
    id: string;
    name: string;
    type: string;
    size: number;
    content: string;
    pageCount?: number;
    wordCount?: number;
}

export type FileType = 'pdf' | 'docx' | 'doc' | 'txt' | 'md' | 'rtf' | 'xlsx' | 'xls' | 'csv' | 'odt' | 'ods';

export const ACCEPTED_FILE_TYPES: Record<FileType, string[]> = {
    pdf: ['application/pdf'],
    docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    doc: ['application/msword'],
    txt: ['text/plain'],
    md: ['text/markdown', 'text/x-markdown'],
    rtf: ['application/rtf', 'text/rtf'],
    xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    xls: ['application/vnd.ms-excel'],
    csv: ['text/csv'],
    odt: ['application/vnd.oasis.opendocument.text'],
    ods: ['application/vnd.oasis.opendocument.spreadsheet'],
};

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_TOTAL_SIZE = 200 * 1024 * 1024; // 200MB
export const MAX_FILES = 50;