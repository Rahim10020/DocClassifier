import { elbow } from './elbow.js';
import { TfIdfVectorizer } from './vectorizers/tfIdf.js';
import { KMeans } from './clustering/kMeans.js';
import { Document, CategoryResult, Category } from './types';

const MAX_K = 7; // Reduced from 10
const MAX_ITERATIONS = 50; // Reduced from 100
const MIN_DOCUMENTS = 3;

export class Categorizer {
    async categorize(documents: Document[]): Promise<CategoryResult> {
        if (documents.length < MIN_DOCUMENTS) {
            return { categories: [], error: 'Not enough documents for classification' };
        }

        const vectorizer = new TfIdfVectorizer();
        const vectors = vectorizer.fitTransform(documents.map(d => d.text));

        // Use elbow method to find optimal K
        const optimalK = await this.findOptimalK(vectors);

        const kmeans = new KMeans({
            k: optimalK,
            maxIterations: MAX_ITERATIONS,
            tolerance: 0.001
        });

        const clusters = await kmeans.fit(vectors);
        return this.generateCategories(documents, clusters);
    }

    private async findOptimalK(vectors: number[][]): Promise<number> {
        const scores = await elbow(vectors, {
            kRange: { min: 2, max: MAX_K },
            maxIterations: 30
        });

        return scores.optimalK;
    }

    private generateCategories(documents: Document[], clusters: number[]): CategoryResult {
        const categories: Category[] = [];
        const clusterGroups = new Map<number, Document[]>();

        // Group documents by cluster
        documents.forEach((doc, index) => {
            const cluster = clusters[index];
            if (!clusterGroups.has(cluster)) {
                clusterGroups.set(cluster, []);
            }
            clusterGroups.get(cluster)!.push(doc);
        });

        // Generate categories from clusters
        clusterGroups.forEach((docs, clusterId) => {
            const keywords = this.extractKeywords(docs);
            categories.push({
                id: `cluster_${clusterId}`,
                name: `Category ${clusterId + 1}`,
                confidence: 0.8, // Default confidence
                documents: docs.map(d => d.id),
                keywords: keywords.slice(0, 5) // Top 5 keywords
            });
        });

        return { categories };
    }

    private extractKeywords(documents: Document[]): string[] {
        const wordFreq = new Map<string, number>();

        documents.forEach(doc => {
            const words = doc.text.toLowerCase()
                .replace(/[^\w\s]/g, ' ')
                .split(/\s+/)
                .filter(word => word.length > 3); // Filter short words

            words.forEach(word => {
                wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
            });
        });

        return Array.from(wordFreq.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word]) => word);
    }
}