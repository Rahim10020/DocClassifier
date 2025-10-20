// Consolidated utility functions
// Merged from helpers.ts and formatters.ts

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { File, FileText, FileSpreadsheet } from 'lucide-react';

// ==================== CLASS UTILITIES ====================

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ==================== DATE & TIME UTILITIES ====================

/**
 * Format date to localized string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format duration in milliseconds to human readable string
 */
export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${Number(seconds)}s`;
}

/**
 * Calculate expiration date (24 hours from now)
 */
export function getExpirationDate(): Date {
  const date = new Date();
  date.setHours(date.getHours() + 24);
  return date;
}

/**
 * Check if a classification has expired
 */
export function isExpired(expiresAt: Date | string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

// ==================== FILE UTILITIES ====================

/**
 * Format file size in bytes to human readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file icon component based on MIME type
 */
export function getFileIcon(mimeType: string): React.ComponentType<{ className?: string }> {
  if (mimeType.startsWith('application/pdf')) return FileText;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType === 'text/csv') return FileSpreadsheet;
  return File;
}

/**
 * Generate a unique filename for uploaded files
 */
export function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const extension = originalName.split('.').pop();
  return `${timestamp}_${random}.${extension}`;
}

/**
 * Extract file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Check if file type is supported for document processing
 */
export function isSupportedFileType(mimeType: string): boolean {
  const supportedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/msword',
    'application/vnd.ms-excel',
  ];
  return supportedTypes.includes(mimeType);
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFileName(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}

// ==================== SESSION & ID UTILITIES ====================

/**
 * Generate a unique session ID for file uploads
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ==================== TEXT UTILITIES ====================

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
}

// ==================== CATEGORY UTILITIES ====================

/**
 * Generate category path from parent path and category name
 */
export function generateCategoryPath(parentPath: string | null, categoryName: string): string {
  if (!parentPath || parentPath === '/') {
    return `/${categoryName}`;
  }
  return `${parentPath}/${categoryName}`;
}

/**
 * Generate a random color for categories
 */
export function generateCategoryColor(index: number): string {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  ];
  return colors[index % colors.length];
}

// ==================== CALCULATION UTILITIES ====================

/**
 * Calculate total size of documents
 */
export function calculateTotalSize(documents: { fileSize: number }[]): number {
  return documents.reduce((total, doc) => total + doc.fileSize, 0);
}

// ==================== SERIALIZATION UTILITIES ====================

/**
 * Converts BigInt fields to strings recursively for JSON safety
 */
export function serializeBigInt<T>(value: T): T {
  if (value === null || value === undefined) return value;
  if (typeof value === 'bigint') {
    return (value.toString() as unknown) as T;
  }
  if (Array.isArray(value)) {
    return (value.map(serializeBigInt) as unknown) as T;
  }
  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = serializeBigInt(val as never);
    }
    return (result as unknown) as T;
  }
  return value;
}

// ==================== PERFORMANCE UTILITIES ====================

/**
 * Debounce function to limit function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (Array.isArray(obj)) return obj.map(item => deepClone(item)) as any;

  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}
