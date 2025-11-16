import keywordExtractor from 'keyword-extractor';
import natural from 'natural';

export interface KeywordExtractionOptions {
    language?: 'fr' | 'en';
    maxKeywords?: number;
    minLength?: number;
}

// Limite de taille de texte pour l'extraction (50000 caractères = ~10000 mots)
const MAX_TEXT_LENGTH_FOR_EXTRACTION = 50000;

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
        // Limiter la taille du texte pour éviter les traitements trop longs
        const processedText = text.length > MAX_TEXT_LENGTH_FOR_EXTRACTION
            ? text.substring(0, MAX_TEXT_LENGTH_FOR_EXTRACTION)
            : text;

        // Extraction via keyword-extractor
        let extractedKeywords: string[] = [];

        try {
            const result = keywordExtractor.extract(processedText, {
                language: language === 'fr' ? 'french' : 'english',
                remove_digits: false,
                return_changed_case: true,
                remove_duplicates: true,
            });

            // Vérifier que le résultat est bien un tableau
            extractedKeywords = Array.isArray(result) ? result : [];
        } catch (extractError) {
            console.error('keyword-extractor.extract failed:', extractError);
            // Fallback: extraire manuellement les mots simples
            extractedKeywords = processedText
                .toLowerCase()
                .split(/\s+/)
                .filter(word => word.length >= minLength && /^[a-zàâäéèêëïîôùûüÿæœç]+$/i.test(word))
                .slice(0, 100);
        }

        if (extractedKeywords.length === 0) {
            console.warn('No keywords extracted from text');
            return [];
        }

        // Stemming pour normalisation
        const stemmer = language === 'fr' ? natural.PorterStemmerFr : natural.PorterStemmer;

        const normalizedKeywords = extractedKeywords
            .filter(keyword => keyword && keyword.length >= minLength)
            .map(keyword => {
                try {
                    return stemmer.stem(keyword.toLowerCase());
                } catch (stemError) {
                    console.error('Stemming error for keyword:', keyword, stemError);
                    return keyword.toLowerCase();
                }
            })
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

    // Limiter la taille du texte pour le calcul de fréquence
    const textToSearch = text.length > MAX_TEXT_LENGTH_FOR_EXTRACTION
        ? text.substring(0, MAX_TEXT_LENGTH_FOR_EXTRACTION)
        : text;

    const lowerText = textToSearch.toLowerCase();

    keywords.forEach(keyword => {
        // Compter les occurrences de manière optimisée (sans regex)
        const lowerKeyword = keyword.toLowerCase();
        let count = 0;
        let pos = 0;

        while ((pos = lowerText.indexOf(lowerKeyword, pos)) !== -1) {
            count++;
            pos += lowerKeyword.length;
        }

        frequencyMap.set(keyword, count || 1);
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

    // Limiter la taille des textes
    const limitedDocText = documentText.length > MAX_TEXT_LENGTH_FOR_EXTRACTION
        ? documentText.substring(0, MAX_TEXT_LENGTH_FOR_EXTRACTION)
        : documentText;

    keywords.forEach(keyword => {
        const lowerKeyword = keyword.toLowerCase();

        // TF: Term Frequency (optimisé avec indexOf)
        const lowerText = limitedDocText.toLowerCase();
        let count = 0;
        let pos = 0;

        while ((pos = lowerText.indexOf(lowerKeyword, pos)) !== -1) {
            count++;
            pos += lowerKeyword.length;
        }

        const tf = count / Math.max(keywords.length, 1);

        // IDF: Inverse Document Frequency
        const docsWithKeyword = allDocuments.filter(doc =>
            doc.toLowerCase().includes(lowerKeyword)
        ).length;
        const idf = Math.log(allDocuments.length / (docsWithKeyword + 1));

        // TF-IDF
        tfidfMap.set(keyword, tf * idf);
    });

    return tfidfMap;
}