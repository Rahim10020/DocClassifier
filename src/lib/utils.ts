import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(d);
}

export function formatRelativeTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - d.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;

    return formatDate(d);
}

export function getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
}

export function getFileIcon(fileType: string): string {
    const icons: Record<string, string> = {
        pdf: '📄',
        doc: '📝',
        docx: '📝',
        txt: '📃',
        md: '📋',
        rtf: '📝',
        xlsx: '📊',
        xls: '📊',
        csv: '📊',
        odt: '📝',
        ods: '📊',
    };

    return icons[fileType] || '📎';
}

export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

export function sanitizeFilename(filename: string): string {
    return filename
        .replace(/[^a-z0-9.-]/gi, '_')
        .replace(/_{2,}/g, '_')
        .toLowerCase();
}

export function calculateConfidenceColor(confidence: number): string {
    if (confidence >= 0.8) return 'var(--success)';
    if (confidence >= 0.6) return 'var(--warning)';
    return 'var(--error)';
}

export function calculateConfidenceLabel(confidence: number): string {
    if (confidence >= 0.8) return 'Haute';
    if (confidence >= 0.6) return 'Moyenne';
    return 'Faible';
}

export function generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function isSessionExpired(expiresAt: Date | string): boolean {
    const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
    return expiry.getTime() < Date.now();
}

export function calculateSessionExpiry(hours: number = 2): Date {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + hours);
    return expiry;
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((result, item) => {
        const group = String(item[key]);
        if (!result[group]) {
            result[group] = [];
        }
        result[group].push(item);
        return result;
    }, {} as Record<string, T[]>);
}

export function serializeBigInt(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return obj.toString();
    if (Array.isArray(obj)) return obj.map(serializeBigInt);
    if (typeof obj === 'object') {
        const result: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                result[key] = serializeBigInt(obj[key]);
            }
        }
        return result;
    }
    return obj;
}