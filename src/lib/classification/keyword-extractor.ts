/**
 * @fileoverview Module d'extraction de mots-clés pour la classification.
 *
 * Ce module utilise des algorithmes NLP pour extraire les mots-clés significatifs
 * d'un texte. Il combine la bibliothèque keyword-extractor avec le stemming
 * de Natural.js pour normaliser les résultats.
 *
 * Fonctionnalités :
 * - Extraction de mots-clés avec suppression des mots vides
 * - Support multilingue (français et anglais)
 * - Calcul de fréquence et TF-IDF
 * - Protection contre les textes trop longs
 *
 * @module classification/keyword-extractor
 * @author DocClassifier Team
 */

import keywordExtractor from 'keyword-extractor';
import natural from 'natural';

/**
 * Options de configuration pour l'extraction de mots-clés.
 *
 * @interface KeywordExtractionOptions
 * @property {'fr' | 'en'} [language='fr'] - Langue du texte à analyser
 * @property {number} [maxKeywords=20] - Nombre maximum de mots-clés à retourner
 * @property {number} [minLength=3] - Longueur minimale d'un mot-clé valide
 */
export interface KeywordExtractionOptions {
    language?: 'fr' | 'en';
    maxKeywords?: number;
    minLength?: number;
}

/**
 * Limite maximale de caractères pour l'extraction.
 * Équivaut à environ 10000 mots, suffisant pour la plupart des documents.
 * @constant {number}
 */
const MAX_TEXT_LENGTH_FOR_EXTRACTION = 50000;

/**
 * Normalise le texte brut avant extraction :
 * - Normalisation Unicode (NFKC)
 * - Suppression des caractères de contrôle
 * - Remplacement des caractères non alphanumériques (sauf accents et apostrophe) par des espaces
 * - Collapse des espaces multiples
 */
function normalizeTextForExtraction(text: string): string {
    if (!text) return text;
    try {
        // Unicode normalization
        let t = text.normalize('NFKC');
        // Remove control characters
        t = t.replace(/[\p{C}]/gu, ' ');
        // Replace unwanted punctuation (keep letters, numbers, accents, apostrophes and hyphens)
        t = t.replace(/[^\p{L}\p{N}\s'’-]/gu, ' ');
        // Collapse whitespace
        t = t.replace(/\s+/g, ' ').trim();
        return t;
    } catch (err) {
        // If any regex with unicode properties fails on older runtimes, fallback to a simpler cleaning
        try {
            let t = text.replace(/[\x00-\x1F\x7F]/g, ' ');
            t = t.replace(/[^\w\s'’-]/g, ' ');
            t = t.replace(/\s+/g, ' ').trim();
            return t;
        } catch (e) {
            return text;
        }
    }
}

/**
 * Extrait les mots-clés significatifs d'un texte.
 *
 * Le processus d'extraction :
 * 1. Limite le texte à MAX_TEXT_LENGTH_FOR_EXTRACTION caractères
 * 2. Utilise keyword-extractor pour identifier les termes importants
 * 3. Applique le stemming (Porter Stemmer) pour normaliser
 * 4. Supprime les doublons et filtre par longueur minimale
 *
 * @function extractKeywords
 * @param {string} text - Texte source pour l'extraction
 * @param {KeywordExtractionOptions} [options={}] - Options d'extraction
 * @returns {string[]} Tableau de mots-clés normalisés et dédupliqués
 *
 * @example
 * const keywords = extractKeywords('Le rapport financier annuel...', {
 *   language: 'fr',
 *   maxKeywords: 30
 * });
 * // ['rapport', 'financ', 'annuel', ...]
 */
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
        // Apply normalization before extraction
        const cleanedText = normalizeTextForExtraction(text);

        // Limiter la taille du texte pour éviter les traitements trop longs
        const processedText = cleanedText.length > MAX_TEXT_LENGTH_FOR_EXTRACTION
            ? cleanedText.substring(0, MAX_TEXT_LENGTH_FOR_EXTRACTION)
            : cleanedText;

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
        } catch (_extractError) {
            console.error('keyword-extractor.extract failed:', _extractError);
            // Fallback: extraire manuellement les mots simples
            extractedKeywords = processedText
                .toLowerCase()
                .split(/\s+/)
                .filter(word => word.length >= minLength && /^[a-zàâäéèêëïîôùûüÿæœç'’-]+$/i.test(word))
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
                } catch (_stemError) {
                    console.error('Stemming error for keyword:', keyword, _stemError);
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

/**
 * Extrait les mots-clés avec leur fréquence d'apparition dans le texte.
 *
 * Utile pour pondérer l'importance des mots-clés dans l'algorithme
 * de scoring TF-IDF.
 *
 * @function extractKeywordsWithFrequency
 * @param {string} text - Texte source
 * @param {'fr' | 'en'} [language='fr'] - Langue du texte
 * @returns {Map<string, number>} Map des mots-clés avec leur nombre d'occurrences
 *
 * @example
 * const freqMap = extractKeywordsWithFrequency(text, 'fr');
 * freqMap.get('facture'); // 5 (apparaît 5 fois)
 */
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

/**
 * Récupère les N mots-clés les plus fréquents d'un texte.
 *
 * Combine l'extraction et le calcul de fréquence pour retourner
 * les termes les plus représentatifs du document.
 *
 * @function getTopKeywords
 * @param {string} text - Texte source
 * @param {number} [count=10] - Nombre de mots-clés à retourner
 * @param {'fr' | 'en'} [language='fr'] - Langue du texte
 * @returns {string[]} Les N mots-clés les plus fréquents, triés par fréquence décroissante
 *
 * @example
 * const top5 = getTopKeywords(documentText, 5, 'fr');
 */
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

/**
 * Calcule le score TF-IDF des mots-clés d'un document par rapport à un corpus.
 *
 * TF-IDF (Term Frequency - Inverse Document Frequency) :
 * - TF : Fréquence du terme dans le document
 * - IDF : Rareté du terme dans le corpus global
 * - TF-IDF = TF * IDF (termes fréquents mais rares ont un score élevé)
 *
 * @function calculateTFIDF
 * @param {string} documentText - Texte du document à analyser
 * @param {string[]} allDocuments - Corpus de tous les documents pour l'IDF
 * @param {'fr' | 'en'} [language='fr'] - Langue des documents
 * @returns {Map<string, number>} Map des mots-clés avec leur score TF-IDF
 *
 * @example
 * const tfidf = calculateTFIDF(doc, allDocs, 'fr');
 * // Les termes spécifiques au document auront un score élevé
 */
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