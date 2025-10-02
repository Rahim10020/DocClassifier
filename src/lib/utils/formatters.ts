import { File, FileText, FileSpreadsheet } from 'lucide-react';

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

export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${Number(seconds)}s`;
}

export function getFileIcon(mimeType: string): React.ComponentType<{ className?: string }> {
    if (mimeType.startsWith('application/pdf')) return FileText;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType === 'text/csv') return FileSpreadsheet;
    return File;
}