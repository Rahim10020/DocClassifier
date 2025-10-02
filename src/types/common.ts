// Common utility types

// Enum for common statuses (extend as needed)
export enum CommonStatus {
    SUCCESS = 'success',
    ERROR = 'error',
    PENDING = 'pending',
}

// Type for JSON objects (generic)
export type JsonObject = Record<string, unknown>;

// Type for timestamps (ISO strings or Date)
export type Timestamp = string | Date;

// Pagination params
export interface PaginationParams {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// Filter params (generic)
export interface FilterParams {
    [key: string]: string | number | boolean | undefined;
}