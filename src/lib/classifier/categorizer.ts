// src/lib/classifier/categorizer.ts

import kmeans from 'ml-kmeans';
import { calculateTFIDF } from './analyzer';
import { determineOptimalK, assignToCluster } from './clustering';
import { getTopKeywords } from './keywordExtractor';

interface Document {
    id: string;
    text: string;
    // Other properties as needed
}

interface Category {
    id: string;
    name: string;
    documents: Document[];
}

interface ClassificationResult {
    categories: Category[];
    documents: Document[];
}

/**
 * Main function to classify documents.
 * @param documents - Array of documents with text.
 * @returns Classification result with categories and assigned documents.
 * @throws Error if clustering fails.
 */
export function classifyDocuments(documents: Document[]): ClassificationResult {
    try {
        if (documents.length === 0) throw new Error('No documents provided');

        const texts = documents.map((doc) => doc.text);
        const tfidfMatrix = calculateTFIDF(texts);
        const vectors = tfidfMatrix.map((docTfidf) => docTfidf.map((item) => item.tfidf)); // Simplified vector (assumes same terms order; in practice, align terms)

        // Align vectors to same dimension
        const allTerms = new Set<string>();
        tfidfMatrix.forEach((doc) => doc.forEach((item) => allTerms.add(item.term)));
        const termArray = Array.from(allTerms);
        const alignedVectors = tfidfMatrix.map((doc) => {
            const vec = new Array(termArray.length).fill(0);
            doc.forEach((item) => {
                const idx = termArray.indexOf(item.term);
                vec[idx] = item.tfidf;
            });
            return vec;
        });

        const optimalK = determineOptimalK(alignedVectors);
        const { centroids, clusters } = kmeans(alignedVectors, optimalK, {});

        const categories: Category[] = [];
        for (let i = 0; i < optimalK; i++) {
            const clusterDocs = documents.filter((_, idx) => clusters[idx] === i);
            const clusterText = clusterDocs.map((doc) => doc.text).join(' ');
            const categoryName = generateCategoryName(clusterText);
            categories.push({
                id: `cat-${i}`,
                name: categoryName,
                documents: clusterDocs.map((doc) => ({
                    ...doc,
                    confidence: assignConfidence(alignedVectors[documents.indexOf(doc)], centroids[i]),
                })),
            });
        }

        return { categories, documents };
    } catch (error) {
        console.error('Error in document classification:', error);
        throw new Error('Classification process failed.');
    }
}

/**
 * Generates an intelligent category name based on cluster content.
 * @param clusterText - Combined text of cluster documents.
 * @returns Category name.
 */
function generateCategoryName(clusterText: string): string {
    const keywords = getTopKeywords(clusterText, 5);
    return keywords.join(' ').replace(/\b\w/g, (l) => l.toUpperCase()); // Simple capitalization
}

/**
 * Assigns confidence score (0-1) for a document in a cluster.
 * @param vector - Document vector.
 * @param centroid - Cluster centroid.
 * @returns Confidence score (higher is better).
 */
function assignConfidence(vector: number[], centroid: number[]): number {
    // Euclidean distance
    const dist = Math.sqrt(
        vector.reduce((sum, val, idx) => sum + Math.pow(val - centroid[idx], 2), 0)
    );
    // Normalize to 0-1 (assuming max dist is some value; here simplistic inversion)
    return 1 / (1 + dist); // Closer to 1 if dist is small
}