import { kmeans } from 'ml-kmeans';

/**
 * Performs K-means clustering on vectors.
 * @param vectors - Array of vectors.
 * @param k - Number of clusters.
 * @returns Clustering result with centroids and assignments.
 */
export function kMeansClustering(vectors: number[][], k: number): { centroids: number[][]; clusters: number[] } {
    // Validation stricte sans fallback silencieux
    if (!Array.isArray(vectors) || vectors.length === 0) {
        throw new Error('No vectors provided for clustering');
    }
    if (!Number.isFinite(k) || k <= 0 || k > vectors.length) {
        throw new Error(`Invalid k value: ${k}. Must be between 1 and ${vectors.length}`);
    }
    for (let i = 0; i < vectors.length; i++) {
        const v = vectors[i];
        if (!Array.isArray(v) || v.length === 0) {
            throw new Error(`Invalid vector at index ${i}`);
        }
        if (v.some((x) => !Number.isFinite(x))) {
            throw new Error(`Non-finite value in vector at index ${i}`);
        }
    }

    console.log('[clustering] kMeansClustering start', { n: vectors.length, dim: vectors[0]?.length || 0, k });
    const result = kmeans(vectors, k, {
        maxIterations: 100,
        tolerance: 1e-6
    });

    if (!result || !result.centroids || !result.clusters) {
        throw new Error('K-means returned invalid results');
    }
    if (result.clusters.length !== vectors.length) {
        throw new Error(`K-means assignments length mismatch: ${result.clusters.length} != ${vectors.length}`);
    }
    if (result.centroids.length !== k) {
        throw new Error(`K-means centroid count mismatch: ${result.centroids.length} != ${k}`);
    }

    console.log('[clustering] kMeansClustering done', {
        centroids: result.centroids.length,
        clustersCount: new Set(result.clusters).size
    });
    return result;
}

/**
 * Determines optimal K using elbow method.
 * @param vectors - Array of vectors.
 * @returns Optimal K (between 3 and 10).
 */
export function determineOptimalK(vectors: number[][]): number {
    const maxK = Math.min(10, vectors.length);
    const minK = Math.min(3, Math.floor(vectors.length / 2)); // Ensure we don't try more clusters than documents/2
    const wcss: number[] = []; // Within-cluster sum of squares

    console.log('[clustering] determineOptimalK', { n: vectors.length, minK, maxK });

    for (let k = minK; k <= maxK; k++) {
        try {
            const { centroids, clusters } = kMeansClustering(vectors, k);

            if (!centroids || centroids.length !== k || !clusters || clusters.length !== vectors.length) {
                console.warn(`[clustering] Invalid results for k=${k}`);
                wcss.push(Infinity);
                continue;
            }

            let sum = 0;
            for (let i = 0; i < vectors.length; i++) {
                const centroid = centroids[clusters[i]];
                if (centroid) {
                    sum += vectors[i].reduce((acc, val, j) => acc + Math.pow(val - centroid[j], 2), 0);
                }
            }
            wcss.push(sum);

            console.log('[clustering] elbow step', { k, wcss: Number.isFinite(sum) ? Number(sum.toFixed(2)) : 'inf', clusters: new Set(clusters).size });
        } catch (error) {
            console.error(`[clustering] Error in k-means for k=${k}`, { error });
            wcss.push(Infinity);
        }
    }

    // Find elbow: largest difference in WCSS
    let maxDiff = 0;
    let optimalK = minK;
    for (let i = 1; i < wcss.length; i++) {
        const currentWCSS = wcss[i] || Infinity;
        const prevWCSS = wcss[i - 1] || Infinity;

        if (currentWCSS === Infinity || prevWCSS === Infinity) {
            continue;
        }

        const diff = prevWCSS - currentWCSS;
        if (diff > maxDiff) {
            maxDiff = diff;
            optimalK = i + minK;
        }
    }

    console.log('[clustering] optimalK selected', { optimalK, maxDiff: Number(maxDiff.toFixed(2)) });
    return Math.max(minK, optimalK);
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