import fs from 'fs/promises';
import path from 'path';
import { logger } from '@/lib/utils/logger';

export class TempStorage {
    private sessionId: string;

    constructor(sessionId?: string) {
        this.sessionId = sessionId || this.generateSessionId();
    }

    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getFilePath(documentId: string): string {
        return path.join('/tmp', this.sessionId, 'documents', documentId);
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
            const basePath = path.join('/tmp', this.sessionId); // Assume sessionId
            const targetPath = classificationId ? path.join(basePath, classificationId) : basePath;

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