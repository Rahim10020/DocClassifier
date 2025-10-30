import keywordExtractor from 'keyword-extractor';
import natural from 'natural';

export interface KeywordExtractionOptions {
    language?: 'fr' | 'en';
    maxKeywords?: number;
    minLength?: number;
}

export function extractKeywords(
    text: string,
    options: KeywordExtractionOptions = {}
): string[] {
    const {
        language = 'fr',
        maxKeywords = 20,
        minLength = 3,
    } = options;

    if (!text || text.trim().length === 0) {
        return [];
    }

    try {
        // Extraction via keyword-extractor
        const extractedKeywords = keywordExtractor.extract(text, {
            language: language === 'fr' ? 'french' : 'english',
            remove_digits: false,
            return_changed_case: true,
            remove_duplicates: true,
        });

        // Stemming pour normalisation
        const stemmer = language === 'fr' ? natural.PorterStemmerFr : natural.PorterStemmer;

        const normalizedKeywords = extractedKeywords
            .filter(keyword => keyword.length >= minLength)
            .map(keyword => stemmer.stem(keyword.toLowerCase()))
            .filter((keyword, index, self) => self.indexOf(keyword) === index); // Remove duplicates

        // Limiter le nombre de mots-clés
        return normalizedKeywords.slice(0, maxKeywords);
    } catch (error) {
        console.error('Error extracting keywords:', error);
        return [];
    }
}

export function extractKeywordsWithFrequency(
    text: string,
    language: 'fr' | 'en' = 'fr'
): Map<string, number> {
    const keywords = extractKeywords(text, { language, maxKeywords: 100 });
    const frequencyMap = new Map<string, number>();

    const lowerText = text.toLowerCase();

    keywords.forEach(keyword => {
        // Compter les occurrences
        const regex = new RegExp(`\\b${keyword}\\w*\\b`, 'gi');
        const matches = lowerText.match(regex);
        frequencyMap.set(keyword, matches ? matches.length : 1);
    });

    return frequencyMap;
}

export function getTopKeywords(
    text: string,
    count: number = 10,
    language: 'fr' | 'en' = 'fr'
): string[] {
    const frequencyMap = extractKeywordsWithFrequency(text, language);

    return Array.from(frequencyMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, count)
        .map(([keyword]) => keyword);
}

export function calculateTFIDF(
    documentText: string,
    allDocuments: string[],
    language: 'fr' | 'en' = 'fr'
): Map<string, number> {
    const keywords = extractKeywords(documentText, { language });
    const tfidfMap = new Map<string, number>();

    keywords.forEach(keyword => {
        // TF: Term Frequency
        const tf = (documentText.toLowerCase().match(new RegExp(keyword, 'g')) || []).length / keywords.length;

        // IDF: Inverse Document Frequency
        const docsWithKeyword = allDocuments.filter(doc =>
            doc.toLowerCase().includes(keyword)
        ).length;
        const idf = Math.log(allDocuments.length / (docsWithKeyword + 1));

        // TF-IDF
        tfidfMap.set(keyword, tf * idf);
    });

    return tfidfMap;
}