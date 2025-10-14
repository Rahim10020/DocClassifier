import { useEffect, useState } from 'react';
import { fetchClassificationStatus } from '@/lib/api/classification';

interface StatusState {
    completed?: boolean;
    status?: string;
    documents?: Array<{
        id: string;
        originalName: string;
        extractedText?: string;
        categoryName?: string;
        confidence?: number;
    }>;
    error?: string;
}

const INITIAL_POLL_INTERVAL = 2000;
const MAX_POLL_INTERVAL = 5000;
const MAX_POLL_TIME = 5 * 60 * 1000; // 5 minutes

function useClassificationStatus(jobId: string) {
    const [status, setStatus] = useState<StatusState | null>(null);

    useEffect(() => {
        let pollInterval = INITIAL_POLL_INTERVAL;
        let timeoutId: NodeJS.Timeout | null = null;
        const startTime = Date.now();

        const poll = async () => {
            try {
                const response = await fetchClassificationStatus(jobId);
                const result = {
                    completed: response.classification.status === 'READY' || response.classification.status === 'VALIDATED' || response.classification.status === 'DOWNLOADED',
                    status: response.classification.status,
                    documents: response.classification.documents || []
                };
                setStatus(result);

                if (!result.completed) {
                    if (Date.now() - startTime < MAX_POLL_TIME) {
                        // Exponential backoff
                        pollInterval = Math.min(pollInterval * 1.5, MAX_POLL_INTERVAL);
                        timeoutId = setTimeout(poll, pollInterval);
                    } else {
                        setStatus({ error: 'Classification timeout' });
                    }
                }
            } catch (err) {
                setStatus({ error: err instanceof Error ? err.message : 'Unknown error' });
            }
        };

        poll();
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [jobId]);

    return status;
}

export default useClassificationStatus;