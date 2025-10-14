import { apiClient } from './apiClient';

export interface ClassificationStatusResponse {
    classification: {
        id: string;
        status: string;
        createdAt: string;
        processedAt?: string;
        validatedAt?: string;
        downloadedAt?: string;
        documents?: Array<{
            id: string;
            originalName: string;
            extractedText?: string;
            categoryName?: string;
            confidence?: number;
        }>;
    };
}

export async function fetchClassificationStatus(id: string): Promise<ClassificationStatusResponse> {
    return apiClient(`/classification/${id}/status`);
}

export async function updateClassificationStatus(id: string, status: string): Promise<void> {
    return apiClient(`/classification/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
    });
}