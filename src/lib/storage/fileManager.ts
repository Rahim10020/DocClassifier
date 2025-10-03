import fs from 'fs/promises';
import path from 'path';
import { generateFileName, formatFileSize, isSupportedFileType } from '@/lib/utils/helpers';

/**
 * File manager for handling temporary file storage and operations
 */
export class FileManager {
    private tempDir: string;

    constructor(tempDir: string = '/tmp/classifier') {
        this.tempDir = tempDir;
    }

    /**
     * Ensure temporary directory exists
     */
    async ensureTempDir(): Promise<void> {
        try {
            await fs.access(this.tempDir);
        } catch {
            await fs.mkdir(this.tempDir, { recursive: true });
        }
    }

    /**
     * Save uploaded file to temporary storage
     */
    async saveUploadedFile(
        file: File | Buffer,
        originalName: string,
        sessionId: string
    ): Promise<{ filename: string; filepath: string; size: number }> {
        await this.ensureTempDir();

        const filename = generateFileName(originalName);
        const sessionDir = path.join(this.tempDir, sessionId);
        const filepath = path.join(sessionDir, filename);

        // Ensure session directory exists
        await fs.mkdir(sessionDir, { recursive: true });

        // Handle different file types
        if (file instanceof File) {
            // Browser File object
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            await fs.writeFile(filepath, buffer);
            return {
                filename,
                filepath,
                size: file.size,
            };
        } else {
            // Buffer (Node.js)
            await fs.writeFile(filepath, file);
            const stats = await fs.stat(filepath);
            return {
                filename,
                filepath,
                size: stats.size,
            };
        }
    }

    /**
     * Read file from temporary storage
     */
    async readFile(sessionId: string, filename: string): Promise<Buffer> {
        const filepath = path.join(this.tempDir, sessionId, filename);
        return await fs.readFile(filepath);
    }

    /**
     * Delete file from temporary storage
     */
    async deleteFile(sessionId: string, filename: string): Promise<void> {
        const filepath = path.join(this.tempDir, sessionId, filename);
        try {
            await fs.unlink(filepath);
        } catch (error) {
            // File might not exist, ignore error
            console.warn(`File not found for deletion: ${filepath}`);
        }
    }

    /**
     * Delete entire session directory
     */
    async deleteSession(sessionId: string): Promise<void> {
        const sessionDir = path.join(this.tempDir, sessionId);
        try {
            await fs.rm(sessionDir, { recursive: true, force: true });
        } catch (error) {
            console.warn(`Session directory not found for deletion: ${sessionDir}`);
        }
    }

    /**
     * Get file information
     */
    async getFileInfo(sessionId: string, filename: string): Promise<{
        size: number;
        createdAt: Date;
        exists: boolean;
    }> {
        const filepath = path.join(this.tempDir, sessionId, filename);

        try {
            const stats = await fs.stat(filepath);
            return {
                size: stats.size,
                createdAt: stats.birthtime,
                exists: true,
            };
        } catch {
            return {
                size: 0,
                createdAt: new Date(),
                exists: false,
            };
        }
    }

    /**
     * List all files in a session
     */
    async listSessionFiles(sessionId: string): Promise<Array<{
        filename: string;
        size: number;
        createdAt: Date;
    }>> {
        const sessionDir = path.join(this.tempDir, sessionId);

        try {
            const files = await fs.readdir(sessionDir);
            const fileInfo = await Promise.all(
                files.map(async (filename) => {
                    const filepath = path.join(sessionDir, filename);
                    const stats = await fs.stat(filepath);

                    return {
                        filename,
                        size: stats.size,
                        createdAt: stats.birthtime,
                    };
                })
            );

            return fileInfo;
        } catch {
            return [];
        }
    }

    /**
     * Clean up old sessions (older than specified hours)
     */
    async cleanupOldSessions(maxAgeHours: number = 24): Promise<{
        deletedSessions: number;
        freedSpace: number;
    }> {
        const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);

        try {
            const sessions = await fs.readdir(this.tempDir);
            let deletedSessions = 0;
            let freedSpace = 0;

            for (const sessionId of sessions) {
                const sessionDir = path.join(this.tempDir, sessionId);

                try {
                    const stats = await fs.stat(sessionDir);
                    if (stats.birthtime.getTime() < cutoffTime) {
                        const files = await this.listSessionFiles(sessionId);
                        freedSpace += files.reduce((total, file) => total + file.size, 0);

                        await fs.rm(sessionDir, { recursive: true, force: true });
                        deletedSessions++;
                    }
                } catch (error) {
                    console.warn(`Error processing session ${sessionId}:`, error);
                }
            }

            return { deletedSessions, freedSpace };
        } catch (error) {
            console.error('Error during cleanup:', error);
            return { deletedSessions: 0, freedSpace: 0 };
        }
    }

    /**
     * Validate uploaded file
     */
    validateFile(file: File | { size: number; name: string }): {
        isValid: boolean;
        error?: string;
    } {
        const maxSize = 50 * 1024 * 1024; // 50MB
        const minSize = 1; // 1 byte

        if (file.size < minSize) {
            return { isValid: false, error: 'File is empty' };
        }

        if (file.size > maxSize) {
            return {
                isValid: false,
                error: `File size exceeds limit of ${formatFileSize(maxSize)}`
            };
        }

        return { isValid: true };
    }

    /**
     * Get MIME type from file extension
     */
    getMimeType(filename: string): string {
        const ext = filename.split('.').pop()?.toLowerCase();

        const mimeTypes: Record<string, string> = {
            'pdf': 'application/pdf',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'doc': 'application/msword',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'xls': 'application/vnd.ms-excel',
            'txt': 'text/plain',
        };

        return mimeTypes[ext || ''] || 'application/octet-stream';
    }

    /**
     * Check if file type is supported for processing
     */
    isProcessableFile(filename: string): boolean {
        const mimeType = this.getMimeType(filename);
        return isSupportedFileType(mimeType);
    }
}

// Export singleton instance
export const fileManager = new FileManager();