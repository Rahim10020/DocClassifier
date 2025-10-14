export interface Document {
    id: string;
    text: string;
    metadata?: {
        filename?: string;
        size?: number;
        type?: string;
    };
}

export interface CategoryResult {
    categories: Category[];
    error?: string;
}

export interface Category {
    id: string;
    name: string;
    confidence: number;
    documents: string[]; // Document IDs
    keywords: string[];
}

export interface Vectorizer {
    fitTransform(texts: string[]): number[][];
}

export interface ClusteringResult {
    centroids: number[][];
    clusters: number[];
    silhouette?: number;
}