// Generic API response type
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    code?: number; // HTTP status code
}

// API error type
export interface ApiError {
    code: number;
    message: string;
    details?: unknown;
}

// Paginated response type
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}