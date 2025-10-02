import kmeans from 'ml-kmeans';

/**
 * Performs K-means clustering on vectors.
 * @param vectors - Array of vectors.
 * @param k - Number of clusters.
 * @returns Clustering result with centroids and assignments.
 */
export function kMeansClustering(vectors: number[][], k: number): { centroids: number[][]; clusters: number[] } {
    return kmeans(vectors, k, {});
}

/**
 * Determines optimal K using elbow method.
 * @param vectors - Array of vectors.
 * @returns Optimal K (between 3 and 10).
 */
export function determineOptimalK(vectors: number[][]): number {
    const maxK = Math.min(10, vectors.length);
    const minK = 3;
    const wcss: number[] = []; // Within-cluster sum of squares

    for (let k = minK; k <= maxK; k++) {
        const { centroids, clusters } = kMeansClustering(vectors, k);
        let sum = 0;
        for (let i = 0; i < vectors.length; i++) {
            const centroid = centroids[clusters[i]];
            sum += vectors[i].reduce((acc, val, j) => acc + Math.pow(val - centroid[j], 2), 0);
        }
        wcss.push(sum);
    }

    // Find elbow: largest difference in WCSS
    let maxDiff = 0;
    let optimalK = minK;
    for (let i = 1; i < wcss.length; i++) {
        const diff = wcss[i - 1] - wcss[i];
        if (diff > maxDiff) {
            maxDiff = diff;
            optimalK = i + minK;
        }
    }
    return optimalK;
}

/**
 * Assigns a vector to the nearest cluster centroid.
 * @param vector - The vector to assign.
 * @param centroids - Array of centroids.
 * @returns Cluster index.
 */
export function assignToCluster(vector: number[], centroids: number[][]): number {
    let minDist = Infinity;
    let cluster = 0;
    centroids.forEach((centroid, idx) => {
        const dist = Math.sqrt(vector.reduce((sum, val, j) => sum + Math.pow(val - centroid[j], 2), 0));
        if (dist < minDist) {
            minDist = dist;
            cluster = idx;
        }
    });
    return cluster;
}