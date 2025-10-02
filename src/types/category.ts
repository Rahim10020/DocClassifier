import type { DocumentMetadata } from './document';

// Basic Category interface
export interface Category {
    id?: string; // Optional, as categories may be virtual in JSON structure
    name: string;
    path: string; // Full path (e.g., "Root/Subcategory")
    parentPath?: string; // For hierarchy
    confidenceThreshold?: number; // Optional for classification
}

// CategoryNode for tree structure (used in UI/review)
export interface CategoryNode extends Category {
    children: CategoryNode[]; // Recursive subcategories
    documents: DocumentMetadata[]; // Attached documents
    isExpanded?: boolean; // UI state
}

// Category with documents (for queries)
export type CategoryWithDocuments = Category & {
    documents: DocumentMetadata[];
};