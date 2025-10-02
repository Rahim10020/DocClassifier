import { useState } from 'react';
import { streamToBlob, downloadBlob } from '@/lib/utils/download';

interface UseDownloadReturn {
    downloading: boolean;
    progress: number;
    error: string | null;
    downloadZip: (classificationId: string) => Promise<void>;
}

export function useDownload(): UseDownloadReturn {
    const [downloading, setDownloading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const downloadZip = async (classificationId: string) => {
        setDownloading(true);
        setProgress(0);
        setError(null);

        try {
            const res = await fetch(`/api/classification/${classificationId}/download`);

            if (!res.ok) throw new Error('Download failed');
            if (!res.body) throw new Error('No response body');

            const reader = res.body.getReader();
            const contentLength = +(res.headers.get('Content-Length') || 0);

            let receivedLength = 0;
            const chunks: Uint8Array[] = [];

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
                receivedLength += value.length;
                if (contentLength) {
                    setProgress(Math.round((receivedLength / contentLength) * 100));
                }
            }

            const blob = new Blob(chunks as BlobPart[]);
            downloadBlob(blob, `classification_${classificationId}.zip`);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setDownloading(false);
        }
    };

    return { downloading, progress, error, downloadZip };
}