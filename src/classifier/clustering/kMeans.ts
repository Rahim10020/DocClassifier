import { kmeans } from 'ml-kmeans';
import { ClusteringResult } from '../types.js';

/**
 * K-Means clustering implementation
 */
export class KMeans {
    private k: number;
    private maxIterations: number;
    private tolerance: number;

    constructor(options: {
        k: number;
        maxIterations?: number;
        tolerance?: number;
    }) {
        this.k = options.k;
        this.maxIterations = options.maxIterations || 100;
        this.tolerance = options.tolerance || 0.001;
    }

    /**
     * Fit K-means clustering on vectors
     */
    async fit(vectors: number[][]): Promise<number[]> {
        try {
            const result = kmeans(vectors, this.k, {
                maxIterations: this.maxIterations,
                tolerance: this.tolerance
            });

            return result.clusters;
        } catch (error) {
            throw new Error(`K-means clustering failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get cluster centroids
     */
    getCentroids(vectors: number[][], clusters: number[]): number[][] {
        const centroids: number[][] = [];
        const clusterSums: number[][] = [];
        const clusterCounts: number[] = [];

        // Initialize centroids, sums, and counts
        for (let i = 0; i < this.k; i++) {
            centroids.push(new Array(vectors[0].length).fill(0));
            clusterSums.push(new Array(vectors[0].length).fill(0));
            clusterCounts.push(0);
        }

        // Calculate sums for each cluster
        vectors.forEach((vector, index) => {
            const cluster = clusters[index];
            clusterCounts[cluster]++;
            vector.forEach((value, dim) => {
                clusterSums[cluster][dim] += value;
            });
        });

        // Calculate centroids
        clusterSums.forEach((sums, cluster) => {
            if (clusterCounts[cluster] > 0) {
                centroids[cluster] = sums.map(sum => sum / clusterCounts[cluster]);
            }
        });

        return centroids;
    }

    /**
     * Calculate Within-Cluster Sum of Squares (WCSS)
     */
    getWCSS(vectors: number[][], clusters: number[], centroids: number[][]): number {
        let wcss = 0;

        vectors.forEach((vector, index) => {
            const cluster = clusters[index];
            const centroid = centroids[cluster];

            if (centroid) {
                const distance = Math.sqrt(
                    vector.reduce((sum, val, j) => sum + Math.pow(val - centroid[j], 2), 0)
                );
                wcss += distance * distance;
            }
        });

        return wcss;
    }
}