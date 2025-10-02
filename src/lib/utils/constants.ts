export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_FILES_PER_UPLOAD = 50;
export const MAX_TOTAL_SIZE = 500 * 1024 * 1024; // 500MB

export const SESSION_EXPIRY = 30 * 60 * 1000; // 30 minutes
export const CLEANUP_CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour
export const AUTOSAVE_DELAY = 5000; // 5 seconds

export const MIN_CONFIDENCE = 0.5;
export const DEFAULT_CATEGORIES = ['Uncategorized'];

export const MESSAGES = {
    SUCCESS: {
        UPLOAD: 'Files uploaded successfully',
        CLASSIFICATION: 'Classification completed',
        DOWNLOAD: 'Download ready',
    },
    ERROR: {
        UPLOAD: 'Upload failed',
        CLASSIFICATION: 'Classification error',
        AUTH: 'Authentication failed',
    },
} as const;

export const STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    ERROR: 'error',
    EXPIRED: 'expired',
} as const;