export * from './category';
export * from './document';
export * from './session';

// API Response types
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface ApiError {
    message: string;
    code?: string;
    details?: unknown;
}

// Pagination
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

// Search & Filter
export interface SearchFilters {
    query?: string;
    category?: string;
    fileType?: string;
    minConfidence?: number;
    maxConfidence?: number;
}

export interface SortOptions {
    field: string;
    direction: 'asc' | 'desc';
}