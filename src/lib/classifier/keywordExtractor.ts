import natural from 'natural';

/**
 * Gets top N keywords from text using TfIdf.
 * @param text - The input text.
 * @param n - Number of keywords (default 10).
 * @returns Array of top keywords.
 */
export function getTopKeywords(text: string, n: number = 10): string[] {
    const tfidf = new natural.TfIdf();
    tfidf.addDocument(text);
    const measures: { term: string; tfidf: number }[] = [];
    tfidf.listTerms(0).forEach((item) => {
        if (item.term.length > 2 && !/^\d+$/.test(item.term)) { // Filter short or numeric terms
            measures.push({ term: item.term, tfidf: item.tfidf });
        }
    });
    return measures.sort((a, b) => b.tfidf - a.tfidf).slice(0, n).map((item) => item.term);
}