/**
 * @fileoverview Module de scoring pour la classification de documents.
 *
 * Ce module implémente les algorithmes de scoring TF-IDF pondéré pour évaluer
 * la correspondance entre les mots-clés d'un document et les catégories de la taxonomie.
 * Il inclut des optimisations de performance (cache, protection ReDoS).
 *
 * @module classification/scorer
 * @author DocClassifier Team
 */

import natural from 'natural';
import { Category } from '@/types/category';
import { SYSTEM_CATEGORIES } from './constants';

/**
 * Interface représentant le résultat du scoring d'une catégorie.
 *
 * @interface ScoreResult
 * @property {string} categoryId - Identifiant unique de la catégorie
 * @property {string} categoryName - Nom d'affichage de la catégorie
 * @property {string} [subCategory] - Nom de la sous-catégorie si applicable
 * @property {number} score - Score de correspondance calculé (0-1)
 * @property {string[]} matchedKeywords - Mots-clés du document ayant matché avec la catégorie
 */
export interface ScoreResult {
    categoryId: string;
    categoryName: string;
    subCategory?: string;
    score: number;
    matchedKeywords: string[];
}

/**
 * Cache LRU pour les mots-clés normalisés (stemmés).
 * Limite : 10000 entrées pour optimiser la mémoire.
 * @type {Map<string, string>}
 */
const stemCache = new Map<string, string>();

/**
 * Limite maximale de caractères du texte pour le calcul de fréquence.
 * Utilisée pour éviter les calculs trop coûteux sur de grands documents.
 * @constant {number}
 */
const MAX_TEXT_LENGTH_FOR_FREQUENCY = 10000;

/**
 * Normalise un mot-clé en appliquant le stemming (racinisation).
 *
 * Utilise le Porter Stemmer approprié selon la langue et met en cache
 * les résultats pour optimiser les performances.
 *
 * @function stemKeyword
 * @param {string} keyword - Mot-clé à normaliser
 * @param {string} language - Code de langue ('fr' ou 'en')
 * @returns {string} Mot-clé normalisé (racine)
 *
 * @example
 * stemKeyword('documents', 'fr'); // 'document'
 * stemKeyword('running', 'en');   // 'run'
 */
function stemKeyword(keyword: string, language: string): string {
    const cacheKey = `${language}:${keyword.toLowerCase()}`;

    // Vérifier le cache d'abord
    if (stemCache.has(cacheKey)) {
        return stemCache.get(cacheKey)!;
    }

    const stemmer = language === 'fr' ? natural.PorterStemmerFr : natural.PorterStemmer;
    const stemmed = stemmer.stem(keyword.toLowerCase());

    // Limiter la taille du cache (max 10000 entrées)
    if (stemCache.size < 10000) {
        stemCache.set(cacheKey, stemmed);
    }

    return stemmed;
}

/**
 * Normalise un tableau de mots-clés en appliquant le stemming à chacun.
 *
 * @function normalizeKeywords
 * @param {string[]} keywords - Tableau de mots-clés à normaliser
 * @param {string} language - Code de langue
 * @returns {string[]} Tableau de mots-clés normalisés
 */
function normalizeKeywords(keywords: string[], language: string): string[] {
    return keywords.map(k => stemKeyword(k, language));
}

/**
 * Calcule le poids TF d'un mot-clé basé sur sa fréquence dans le document.
 *
 * Inclut des protections contre :
 * - ReDoS : limitation de la longueur des mots-clés à 100 caractères
 * - Performance : limitation du texte analysé à MAX_TEXT_LENGTH_FOR_FREQUENCY
 *
 * @function calculateKeywordWeight
 * @param {string} keyword - Mot-clé à évaluer
 * @param {string} documentText - Texte complet du document
 * @param {number} documentLength - Nombre de mots dans le document
 * @returns {number} Poids TF normalisé (0-0.1)
 */
function calculateKeywordWeight(
    keyword: string,
    documentText: string,
    documentLength: number
): number {
    // Protection contre ReDoS : limiter la longueur des mots-clés
    if (keyword.length > 100) {
        keyword = keyword.substring(0, 100);
    }

    // Limiter la taille du texte pour éviter les calculs coûteux
    const textToSearch = documentText.length > MAX_TEXT_LENGTH_FOR_FREQUENCY
        ? documentText.substring(0, MAX_TEXT_LENGTH_FOR_FREQUENCY)
        : documentText;

    try {
        // Utiliser une approche plus simple sans regex complexe
        const lowerText = textToSearch.toLowerCase();
        const lowerKeyword = keyword.toLowerCase();

        // Compter les occurrences avec split (plus rapide que regex)
        let count = 0;
        let pos = 0;
        while ((pos = lowerText.indexOf(lowerKeyword, pos)) !== -1) {
            count++;
            pos += lowerKeyword.length;
        }

        // TF-IDF simplifié : (fréquence du mot / longueur du doc)
        // Plafonné à 0.1 pour éviter qu'un mot très répété domine trop
        return Math.min(count / Math.max(documentLength, 1), 0.1);
    } catch (error) {
        // En cas d'erreur, retourner 0
        console.error('Erreur lors du calcul du poids du mot-clé:', error);
        return 0;
    }
}

/**
 * Calcule les scores de correspondance d'un document contre toutes les catégories.
 *
 * Pour chaque catégorie :
 * 1. Filtre par profil utilisateur si spécifié
 * 2. Calcule l'intersection des mots-clés
 * 3. Applique la pondération TF-IDF
 * 4. Ajoute le bonus de priorité de la catégorie
 * 5. Teste les sous-catégories pour une classification plus fine
 *
 * @function scoreAgainstTaxonomy
 * @param {string[]} documentKeywords - Mots-clés extraits du document
 * @param {Category[]} categories - Catégories de la taxonomie à tester
 * @param {string} [profile] - Profil utilisateur pour filtrer les catégories
 * @param {string} [language='fr'] - Langue du document
 * @param {string} [documentText] - Texte complet pour le calcul TF-IDF
 * @returns {ScoreResult[]} Tableau de scores triés par score décroissant
 *
 * @example
 * const scores = scoreAgainstTaxonomy(
 *   ['facture', 'paiement', 'montant'],
 *   taxonomy,
 *   'professional',
 *   'fr',
 *   documentFullText
 * );
 */
export function scoreAgainstTaxonomy(
    documentKeywords: string[],
    categories: Category[],
    profile?: string,
    language: string = 'fr',
    documentText?: string
): ScoreResult[] {
    const scores: ScoreResult[] = [];
    const normalizedDocKeywords = normalizeKeywords(documentKeywords, language);

    // Utiliser un Set pour des recherches O(1) au lieu de O(n)
    const normalizedDocKeywordsSet = new Set(normalizedDocKeywords);

    const documentLength = documentText ? documentText.split(/\s+/).length : documentKeywords.length;

    for (const category of categories) {
        // Filtrer par profil si spécifié (sauf si "auto")
        if (profile && profile !== 'auto' && !category.profiles.includes(profile)) {
            continue;
        }

        // Normaliser les mots-clés de la catégorie
        const categoryKeywords = normalizeKeywords(category.keywords, language);

        // Calcul de l'intersection (optimisé avec Set)
        const intersection = categoryKeywords.filter(k =>
            normalizedDocKeywordsSet.has(k)
        );

        if (intersection.length === 0) continue;

        // Score amélioré avec pondération par fréquence
        let weightedScore = 0;

        if (documentText) {
            // Calculer le score pondéré par la fréquence de chaque mot-clé
            intersection.forEach(keyword => {
                const weight = calculateKeywordWeight(keyword, documentText, documentLength);
                weightedScore += weight;
            });

            // Normaliser par le nombre de mots-clés trouvés
            weightedScore = weightedScore / Math.max(intersection.length, 1);
        } else {
            // Fallback si pas de texte complet
            weightedScore = intersection.length / Math.max(normalizedDocKeywords.length, 1);
        }

        // Appliquer le bonus de priorité
        const priorityBonus = category.priority / 100;
        const score = weightedScore * priorityBonus;

        scores.push({
            categoryId: category.id,
            categoryName: language === 'en' && category.nameEn ? category.nameEn : category.name,
            score,
            matchedKeywords: intersection,
        });

        // Tester les sous-catégories si elles existent
        if (category.children && category.children.length > 0) {
            for (const subCat of category.children) {
                const subScore = calculateSubCategoryScore(
                    normalizedDocKeywords,
                    subCat,
                    language,
                    documentText,
                    documentLength
                );

                if (subScore > score * 0.5) {
                    scores.push({
                        categoryId: category.id,
                        categoryName: language === 'en' && category.nameEn ? category.nameEn : category.name,
                        subCategory: language === 'en' && subCat.nameEn ? subCat.nameEn : subCat.name,
                        score: subScore,
                        matchedKeywords: intersection,
                    });
                }
            }
        }
    }

    // Trier par score décroissant
    return scores.sort((a, b) => b.score - a.score);
}

/**
 * Calcule le score de correspondance pour une sous-catégorie spécifique.
 *
 * Les sous-catégories bénéficient d'un bonus de 1.2x car elles représentent
 * une classification plus précise et spécifique.
 *
 * @function calculateSubCategoryScore
 * @param {string[]} documentKeywords - Mots-clés normalisés du document
 * @param {Category} subCategory - Sous-catégorie à évaluer
 * @param {string} [language='fr'] - Langue du document
 * @param {string} [documentText] - Texte complet pour pondération TF
 * @param {number} [documentLength] - Longueur du document en mots
 * @returns {number} Score de la sous-catégorie (avec bonus 1.2x)
 */
export function calculateSubCategoryScore(
    documentKeywords: string[],
    subCategory: Category,
    language: string = 'fr',
    documentText?: string,
    documentLength?: number
): number {
    const subKeywords = normalizeKeywords(subCategory.keywords, language);
    const intersection = documentKeywords.filter(k => subKeywords.includes(k));

    if (intersection.length === 0) return 0;

    // Utiliser le même système de pondération
    let weightedScore = 0;

    if (documentText && documentLength) {
        intersection.forEach(keyword => {
            const weight = calculateKeywordWeight(keyword, documentText, documentLength);
            weightedScore += weight;
        });
        weightedScore = weightedScore / Math.max(intersection.length, 1);
    } else {
        weightedScore = intersection.length / Math.max(documentKeywords.length, 1);
    }

    // Score plus élevé pour les sous-catégories car plus spécifiques
    return weightedScore * 1.2;
}

/**
 * Calcule un score de confiance basé sur l'écart entre les deux meilleurs scores.
 *
 * La confiance est plus élevée lorsque le meilleur score domine clairement :
 * - 0.9 : score > 0.7 et écart > 0.2 (très confiant)
 * - 0.75 : score > 0.5 et écart > 0.15 (confiant)
 * - 0.6 : score > 0.3 et écart > 0.1 (moyennement confiant)
 * - 0.5 : sinon (peu confiant)
 *
 * @function calculateConfidenceScore
 * @param {number} topScore - Score de la meilleure catégorie
 * @param {number} secondScore - Score de la deuxième meilleure catégorie
 * @returns {number} Score de confiance (0-1)
 */
export function calculateConfidenceScore(
    topScore: number,
    secondScore: number
): number {
    if (topScore === 0) return 0;

    // Confiance élevée si le top score est significativement meilleur
    const gap = topScore - secondScore;

    if (topScore > 0.7 && gap > 0.2) return 0.9;
    if (topScore > 0.5 && gap > 0.15) return 0.75;
    if (topScore > 0.3 && gap > 0.1) return 0.6;

    return 0.5;
}

/**
 * Trouve la meilleure correspondance parmi les scores calculés.
 *
 * Retourne la catégorie avec le score le plus élevé, calcule la confiance,
 * et fournit jusqu'à 3 alternatives pour permettre à l'utilisateur de
 * corriger manuellement si nécessaire.
 *
 * @function findBestMatch
 * @param {ScoreResult[]} scores - Tableau de scores triés par score décroissant
 * @returns {Object} Objet contenant la meilleure catégorie et les alternatives
 * @returns {string} returns.mainCategory - Nom de la catégorie principale
 * @returns {string} [returns.subCategory] - Nom de la sous-catégorie si applicable
 * @returns {number} returns.confidence - Score de confiance (0-1)
 * @returns {ScoreResult[]} returns.alternatives - Top 3 des catégories alternatives
 */
export function findBestMatch(scores: ScoreResult[]): {
    mainCategory: string;
    subCategory?: string;
    confidence: number;
    alternatives: ScoreResult[];
} {
    if (scores.length === 0) {
        return {
            mainCategory: SYSTEM_CATEGORIES.UNCATEGORIZED,
            confidence: 0,
            alternatives: [],
        };
    }

    const best = scores[0];
    const second = scores[1];
    const confidence = calculateConfidenceScore(
        best.score,
        second ? second.score : 0
    );

    return {
        mainCategory: best.categoryName,
        subCategory: best.subCategory,
        confidence,
        alternatives: scores.slice(1, 4), // Top 3 alternatives
    };
}