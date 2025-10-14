import { KMeans } from './clustering/kMeans.js';

interface ElbowOptions {
    kRange: { min: number; max: number };
    maxIterations: number;
}

export async function elbow(vectors: number[][], options: ElbowOptions) {
    const wcss: number[] = [];
    const { min, max } = options.kRange;

    for (let k = min; k <= max; k++) {
        const kmeans = new KMeans({ k, maxIterations: options.maxIterations });
        const clusters = await kmeans.fit(vectors);
        const centroids = kmeans.getCentroids(vectors, clusters);
        wcss.push(kmeans.getWCSS(vectors, clusters, centroids));
    }

    // Find elbow point using second derivative
    const optimalK = findElbowPoint(wcss) + min;
    return { optimalK, wcss };
}

function findElbowPoint(wcss: number[]): number {
    if (wcss.length < 3) return 0;

    const diffs = wcss.slice(1).map((v, i) => wcss[i] - v);
    const secondDiffs = diffs.slice(1).map((v, i) => diffs[i] - v);

    return secondDiffs.indexOf(Math.max(...secondDiffs));
}
