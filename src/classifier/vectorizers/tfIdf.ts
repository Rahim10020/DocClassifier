import * as natural from 'natural';
import { Vectorizer } from '../types';

/**
 * TF-IDF Vectorizer for text documents
 */
export class TfIdfVectorizer implements Vectorizer {
    private tfidf: natural.TfIdf;
    private vocabulary: Map<string, number>;

    constructor() {
        this.tfidf = new natural.TfIdf();
        this.vocabulary = new Map();
    }

    /**
     * Fit the vectorizer on texts and transform them to vectors
     */
    fitTransform(texts: string[]): number[][] {
        // Add all documents to TF-IDF
        texts.forEach((text, index) => {
            const processedText = this.preprocessText(text);
            this.tfidf.addDocument(processedText);

            // Build vocabulary
            const words = processedText.split(/\s+/);
            words.forEach(word => {
                if (!this.vocabulary.has(word)) {
                    this.vocabulary.set(word, this.vocabulary.size);
                }
            });
        });

        // Transform texts to vectors
        return texts.map(text => this.transform(text));
    }

    /**
     * Transform a single text to vector
     */
    transform(text: string): number[] {
        const processedText = this.preprocessText(text);
        const vector: number[] = new Array(this.vocabulary.size).fill(0);

        // Calculate TF-IDF scores for each vocabulary word
        Array.from(this.vocabulary.entries()).forEach(([word, index]) => {
            const score = this.getTfIdfScore(processedText, word);
            vector[index] = score;
        });

        return vector;
    }

    /**
     * Preprocess text for better vectorization
     */
    private preprocessText(text: string): string {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ') // Remove punctuation
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
    }

    /**
     * Get TF-IDF score for a term in a document
     */
    private getTfIdfScore(document: string, term: string): number {
        const words = document.split(/\s+/);
        const termFrequency = words.filter(word => word === term).length / words.length;

        // Calculate inverse document frequency
        let documentFrequency = 0;
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
     * Get vocabulary size
     */
    getVocabularySize(): number {
        return this.vocabulary.size;
    }
}