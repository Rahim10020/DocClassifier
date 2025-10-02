import natural from 'natural';
const tokenizer = new natural.WordTokenizer();
const stopwords = natural.stopwords;

/**
 * Preprocesses text: lowercase, remove punctuation, tokenize.
 * @param text - The input text.
 * @returns Array of tokens.
 */
export function preprocessText(text: string): string[] {
    const lowerText = text.toLowerCase().replace(/[^\w\s]/g, ''); // Remove punctuation
    return tokenizer.tokenize(lowerText) || [];
}

/**
 * Removes stop words from tokens.
 * @param tokens - Array of tokens.
 * @returns Filtered tokens.
 */
export function removeStopWords(tokens: string[]): string[] {
    return tokens.filter((token) => !stopwords.includes(token));
}

/**
 * Extracts top N keywords from text after preprocessing.
 * @param text - The input text.
 * @param n - Number of keywords (default 10).
 * @returns Array of keywords.
 */
export function extractKeywords(text: string, n: number = 10): string[] {
    const tokens = removeStopWords(preprocessText(text));
    const tfidf = new natural.TfIdf();
    tfidf.addDocument(tokens.join(' '));
    const measures: { term: string; tfidf: number }[] = [];
    tfidf.listTerms(0).forEach((item) => {
        measures.push({ term: item.term, tfidf: item.tfidf });
    });
    return measures.sort((a, b) => b.tfidf - a.tfidf).slice(0, n).map((item) => item.term);
}

/**
 * Calculates TF-IDF matrix for multiple documents.
 * @param documents - Array of document texts.
 * @returns TF-IDF matrix (array of objects with term and tfidf).
 */
export function calculateTFIDF(documents: string[]): { term: string; tfidf: number }[][] {
    const tfidf = new natural.TfIdf();
    documents.forEach((doc) => tfidf.addDocument(preprocessText(doc).join(' ')));
    const matrix: { term: string; tfidf: number }[][] = [];
    for (let i = 0; i < documents.length; i++) {
        const measures: { term: string; tfidf: number }[] = [];
        tfidf.listTerms(i).forEach((item) => {
            measures.push({ term: item.term, tfidf: item.tfidf });
        });
        matrix.push(measures);
    }
    return matrix;
}