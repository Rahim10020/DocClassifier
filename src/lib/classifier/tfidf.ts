import natural from 'natural';

/**
 * TF-IDF based text classifier for document categorization
 */
export class TFIDFClassifier {
    private tfidf: natural.TfIdf;
    private vocabulary: Set<string>;
    private documentVectors: Map<string, number[]>;

    constructor() {
        this.tfidf = new natural.TfIdf();
        this.vocabulary = new Set();
        this.documentVectors = new Map();
    }

    /**
     * Add document to the training corpus
     */
    addDocument(documentId: string, text: string, category?: string): void {
        // Preprocess text
        const processedText = this.preprocessText(text);

        // Add to TF-IDF
        this.tfidf.addDocument(processedText);

        // Update vocabulary
        const words = processedText.split(/\s+/);
        words.forEach(word => this.vocabulary.add(word));

        // Store document vector for similarity calculations
        const vector = this.getDocumentVector(processedText);
        this.documentVectors.set(documentId, vector);
    }

    /**
     * Preprocess text for better classification
     */
    private preprocessText(text: string): string {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ') // Remove punctuation
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
    }

    /**
     * Get TF-IDF vector for a document
     */
    private getDocumentVector(text: string): number[] {
        const vector: number[] = [];
        const words = text.split(/\s+/);

        for (const word of this.vocabulary) {
            const tfidfScore = this.calculateTFIDF(text, word);
            vector.push(tfidfScore);
        }

        return vector;
    }

    /**
     * Calculate TF-IDF score for a term in a document
     */
    private calculateTFIDF(document: string, term: string): number {
        const words = document.split(/\s+/);
        const termFrequency = words.filter(word => word === term).length / words.length;

        // Calculate inverse document frequency
        let documentFrequency = 0;
        // Access documents through the internal structure
        const docs = (this.tfidf as any).documents;
        if (docs) {
            docs.forEach((doc: string[]) => {
                if (doc.includes(term)) {
                    documentFrequency++;
                }
            });
        }

        const totalDocuments = docs ? docs.length : 1;
        const inverseDocumentFrequency = Math.log(totalDocuments / (1 + documentFrequency));

        return termFrequency * inverseDocumentFrequency;
    }

    /**
     * Classify a document and return similarity scores
     */
    classifyDocument(text: string): Array<{
        documentId: string;
        similarity: number;
        category?: string;
    }> {
        const processedText = this.preprocessText(text);
        const inputVector = this.getDocumentVector(processedText);

        const similarities: Array<{
            documentId: string;
            similarity: number;
            category?: string;
        }> = [];

        for (const [documentId, vector] of this.documentVectors.entries()) {
            const similarity = this.cosineSimilarity(inputVector, vector);
            similarities.push({
                documentId,
                similarity,
            });
        }

        return similarities.sort((a, b) => b.similarity - a.similarity);
    }

    /**
     * Calculate cosine similarity between two vectors
     */
    private cosineSimilarity(vectorA: number[], vectorB: number[]): number {
        if (vectorA.length !== vectorB.length) {
            throw new Error('Vectors must have the same length');
        }

        let dotProduct = 0;
        let magnitudeA = 0;
        let magnitudeB = 0;

        for (let i = 0; i < vectorA.length; i++) {
            dotProduct += vectorA[i] * vectorB[i];
            magnitudeA += vectorA[i] * vectorA[i];
            magnitudeB += vectorB[i] * vectorB[i];
        }

        magnitudeA = Math.sqrt(magnitudeA);
        magnitudeB = Math.sqrt(magnitudeB);

        if (magnitudeA === 0 || magnitudeB === 0) {
            return 0;
        }

        return dotProduct / (magnitudeA * magnitudeB);
    }

    /**
     * Extract keywords from text using TF-IDF
     */
    extractKeywords(text: string, maxKeywords: number = 10): Array<{
        word: string;
        score: number;
    }> {
        const processedText = this.preprocessText(text);
        const words = processedText.split(/\s+/);
        const wordScores = new Map<string, number>();

        for (const word of words) {
            if (word.length < 3) continue; // Skip very short words

            const score = this.calculateTFIDF(processedText, word);
            wordScores.set(word, score);
        }

        return Array.from(wordScores.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, maxKeywords)
            .map(([word, score]) => ({ word, score }));
    }

    /**
     * Get vocabulary size
     */
    getVocabularySize(): number {
        return this.vocabulary.size;
    }

    /**
     * Get number of training documents
     */
    getDocumentCount(): number {
        return this.documentVectors.size;
    }

    /**
     * Clear all training data
     */
    clear(): void {
        this.tfidf = new natural.TfIdf();
        this.vocabulary.clear();
        this.documentVectors.clear();
    }

    /**
     * Get classification confidence based on similarity scores
     */
    getConfidenceScore(similarities: Array<{ similarity: number }>): number {
        if (similarities.length === 0) return 0;

        const topSimilarity = similarities[0]?.similarity || 0;
        const avgSimilarity = similarities.reduce((sum, item) => sum + item.similarity, 0) / similarities.length;

        // Combine top similarity with average for confidence score
        return Math.min(1, (topSimilarity * 0.7 + avgSimilarity * 0.3));
    }
}