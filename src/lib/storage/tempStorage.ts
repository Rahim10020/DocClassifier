import fs from 'fs/promises';
import path from 'path';
import { logger } from '@/lib/utils/logger';

export class TempStorage {
    private sessionId: string;
    private basePath: string;

    constructor(sessionId?: string) {
        this.sessionId = sessionId || this.generateSessionId();
        this.basePath = path.join('/tmp', this.sessionId);
    }

    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Initialize the temporary storage directory
     */
    async init(): Promise<void> {
        try {
            await fs.mkdir(this.basePath, { recursive: true });
            logger('info', 'Temp storage initialized', { sessionId: this.sessionId, basePath: this.basePath });
        } catch (err) {
            const errorMsg = (err as Error).message;
            logger('error', 'Failed to initialize temp storage', { error: errorMsg, basePath: this.basePath });
            throw new Error(`Failed to initialize temp storage: ${errorMsg}`);
        }
    }

    /**
     * Get the base path for this storage session
     */
    getBasePath(): string {
        return this.basePath;
    }

    getFilePath(documentId: string): string {
        return path.join(this.basePath, 'documents', documentId);
    }

    async saveFile(documentId: string, content: Buffer | string): Promise<void> {
        const filePath = this.getFilePath(documentId);
        const dirPath = path.dirname(filePath);

        // Ensure directory exists
        await fs.mkdir(dirPath, { recursive: true });

        // Write file
        await fs.writeFile(filePath, content);
        logger('info', 'File saved to temp storage', { documentId, path: filePath });
    }

    async getFile(documentId: string): Promise<Buffer | null> {
        try {
            const filePath = this.getFilePath(documentId);
            return await fs.readFile(filePath);
        } catch (err) {
            logger('warn', 'File not found in temp storage', { documentId });
            return null;
        }
    }

    async cleanup(classificationId?: string) {
        try {
            const targetPath = classificationId ? path.join(this.basePath, classificationId) : this.basePath;

            if (await this.pathExists(targetPath)) {
                await fs.rm(targetPath, { recursive: true, force: true });
                logger('info', 'Cleaned up temp storage', { path: targetPath });
            } else {
                logger('warn', 'Temp path does not exist, skipping cleanup', { path: targetPath });
            }
        } catch (err) {
            const errorMsg = (err as Error).message;
            logger('error', 'Error during temp cleanup', { error: errorMsg });
            // Do not throw, just log
        }
    }

    private async pathExists(p: string): Promise<boolean> {
        try {
            await fs.access(p);
            return true;
        } catch {
            return false;
        }
    }
}