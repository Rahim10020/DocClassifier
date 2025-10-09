// src/lib/classifier/categorizer.ts

import { kmeans } from 'ml-kmeans';
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

        // Filter out documents with empty or very short text
        const validDocuments = documents.filter(doc => doc.text && doc.text.trim().length > 10);

        if (validDocuments.length === 0) {
            console.warn('No documents with sufficient text content for classification');
            // Return a default category for all documents
            return {
                categories: [{
                    id: 'cat-default',
                    name: 'Non Classé',
                    documents: documents.map(doc => ({ ...doc, confidence: 0 }))
                }],
                documents: documents
            };
        }

        const texts = validDocuments.map((doc) => doc.text);
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

        console.log(`Running k-means clustering with ${alignedVectors.length} vectors and k=${alignedVectors.length < 3 ? Math.min(2, alignedVectors.length) : 3} to ${Math.min(10, alignedVectors.length)}`);

        const optimalK = determineOptimalK(alignedVectors);

        if (optimalK <= 0 || optimalK > alignedVectors.length) {
            console.warn(`Invalid optimal K: ${optimalK}, using fallback`);
            // Create a simple fallback categorization
            return {
                categories: [{
                    id: 'cat-default',
                    name: 'Documents',
                    documents: validDocuments.map(doc => ({ ...doc, confidence: 0.5 }))
                }],
                documents: validDocuments
            };
        }

        console.log(`Using optimal K: ${optimalK}`);
        const { centroids, clusters } = kmeans(alignedVectors, optimalK, {
            maxIterations: 100,
            tolerance: 1e-6
        });

        if (!centroids || !clusters) {
            throw new Error('K-means clustering failed to return valid results');
        }

        console.log(`K-means completed: ${centroids.length} centroids, ${new Set(clusters).size} clusters`);

        const categories: Category[] = [];
        for (let i = 0; i < optimalK; i++) {
            const clusterIndices = validDocuments.map((_, idx) => ({ doc: _, idx })).filter(({ idx: docIdx }) => clusters[docIdx] === i);
            const clusterDocs = clusterIndices.map(({ doc }) => doc);

            if (clusterDocs.length === 0) {
                console.warn(`Empty cluster ${i}, skipping`);
                continue;
            }

            const clusterText = clusterDocs.map((doc) => doc.text).join(' ');
            const categoryName = generateCategoryName(clusterText);

            console.log(`Creating category "${categoryName}" with ${clusterDocs.length} documents`);

            categories.push({
                id: `cat-${i}`,
                name: categoryName,
                documents: clusterIndices.map(({ doc, idx }) => ({
                    ...doc,
                    confidence: assignConfidence(alignedVectors[idx], centroids[i]),
                })),
            });
        }

        // Add documents that couldn't be classified to a default category
        const classifiedDocIds = new Set(categories.flatMap(cat => cat.documents.map(doc => doc.id)));
        const unclassifiedDocs = documents.filter(doc => !classifiedDocIds.has(doc.id));

        if (unclassifiedDocs.length > 0) {
            categories.push({
                id: 'cat-unclassified',
                name: 'Non Classé',
                documents: unclassifiedDocs.map(doc => ({ ...doc, confidence: 0 }))
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