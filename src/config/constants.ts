/**
 * Application constants and configuration values
 */

// File upload limits
export const FILE_UPLOAD_LIMITS = {
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    MIN_FILE_SIZE: 1, // 1 byte
    MAX_FILES_PER_UPLOAD: 100,
    SUPPORTED_MIME_TYPES: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'application/msword',
        'application/vnd.ms-excel',
    ],
} as const;

// Classification settings
export const CLASSIFICATION_SETTINGS = {
    DEFAULT_EXPIRY_HOURS: 24,
    PROCESSING_TIMEOUT_MINUTES: 30,
    MAX_CLASSIFICATIONS_PER_USER: 100,
    MIN_CONFIDENCE_THRESHOLD: 0.3,
    BATCH_SIZE: 10,
} as const;

// UI Constants
export const UI_CONSTANTS = {
    SIDEBAR_WIDTH: 280,
    HEADER_HEIGHT: 64,
    FOOTER_HEIGHT: 32,
    BORDER_RADIUS: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
    },
    ANIMATION_DURATION: {
        fast: 150,
        normal: 300,
        slow: 500,
    },
} as const;

// API Constants
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        LOGOUT: '/api/auth/logout',
        FORGOT_PASSWORD: '/api/auth/forgot-password',
        RESET_PASSWORD: '/api/auth/reset-password',
    },
    CLASSIFICATIONS: {
        BASE: '/api/classification',
        BY_ID: (id: string) => `/api/classification/${id}`,
        STATS: '/api/classification/stats',
        PROCESS: (id: string) => `/api/classification/${id}/process`,
        VALIDATE: (id: string) => `/api/classification/${id}/validate`,
        DOWNLOAD: (id: string) => `/api/classification/${id}/download`,
        UPDATE: (id: string) => `/api/classification/${id}/update`,
        STATUS: (id: string) => `/api/classification/${id}/status`,
    },
    DOCUMENTS: {
        BASE: '/api/documents',
        BY_ID: (id: string) => `/api/documents/${id}`,
        PREVIEW: (id: string) => `/api/documents/${id}/preview`,
        MOVE: (id: string) => `/api/documents/${id}/move`,
        BULK_DELETE: '/api/documents/bulk-delete',
    },
    CATEGORIES: {
        BASE: '/api/categories',
        BY_ID: (id: string) => `/api/categories/${id}`,
        SUGGEST: '/api/categories/suggest',
        MERGE: '/api/categories/merge',
    },
    UPLOAD: '/api/upload',
    USER: {
        PROFILE: '/api/user/profile',
        PASSWORD: '/api/user/password',
        DELETE: '/api/user/delete',
    },
} as const;

// Storage paths
export const STORAGE_PATHS = {
    TEMP_DIR: '/tmp/classifier',
    UPLOAD_DIR: 'uploads',
    PROCESSED_DIR: 'processed',
    ARCHIVE_DIR: 'archive',
} as const;

// Pagination defaults
export const PAGINATION_DEFAULTS = {
    PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    DEFAULT_PAGE: 1,
} as const;

// Search and filter defaults
export const SEARCH_DEFAULTS = {
    DEBOUNCE_DELAY: 300,
    MIN_SEARCH_LENGTH: 2,
    MAX_SEARCH_RESULTS: 50,
} as const;

// Error messages
export const ERROR_MESSAGES = {
    GENERIC: 'An unexpected error occurred',
    NETWORK: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    FORBIDDEN: 'Access to this resource is forbidden.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION: 'Please check your input and try again.',
    FILE_TOO_LARGE: `File size exceeds the limit of ${FILE_UPLOAD_LIMITS.MAX_FILE_SIZE / (1024 * 1024)}MB.`,
    UNSUPPORTED_FILE_TYPE: 'This file type is not supported.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    RATE_LIMITED: 'Too many requests. Please try again later.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: 'Successfully logged in!',
    REGISTER_SUCCESS: 'Account created successfully!',
    PASSWORD_RESET_SENT: 'Password reset email sent!',
    CLASSIFICATION_CREATED: 'Classification created successfully!',
    FILE_UPLOADED: 'File uploaded successfully!',
    PROFILE_UPDATED: 'Profile updated successfully!',
    PASSWORD_CHANGED: 'Password changed successfully!',
} as const;

// Regular expressions
export const REGEX_PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^\+?[\d\s\-\(\)]+$/,
    STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    SESSION_ID: /^session_\d+_[a-z0-9]+$/,
    FILE_NAME: /^[a-zA-Z0-9._\-\s()]+$/,
} as const;

// Feature flags
export const FEATURE_FLAGS = {
    ENABLE_ADVANCED_CLASSIFICATION: true,
    ENABLE_BULK_OPERATIONS: true,
    ENABLE_EXPORT_FEATURES: true,
    ENABLE_REAL_TIME_COLLABORATION: false,
    ENABLE_API_ACCESS: false,
    ENABLE_ANALYTICS: true,
} as const;

// Third-party service configurations
export const THIRD_PARTY_SERVICES = {
    // Add API keys and endpoints for external services here
    // These should be moved to environment variables in production
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
    REDIS_URL: process.env.REDIS_URL,
} as const;

// Performance settings
export const PERFORMANCE_SETTINGS = {
    CACHE_TTL: 300, // 5 minutes
    MAX_CONCURRENT_UPLOADS: 5,
    MAX_CONCURRENT_PROCESSING: 3,
    CLEANUP_INTERVAL_HOURS: 6,
} as const;

// Security settings
export const SECURITY_SETTINGS = {
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION_MINUTES: 15,
    PASSWORD_MIN_LENGTH: 8,
    SESSION_TIMEOUT_HOURS: 24,
    ENABLE_TWO_FACTOR: false,
    ALLOW_PASSWORD_RESET: true,
} as const;