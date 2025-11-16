import natural from 'natural';
import { Category } from '@/types/category';
import { SYSTEM_CATEGORIES } from './constants';

export interface ScoreResult {
    categoryId: string;
    categoryName: string;
    subCategory?: string;
    score: number;
    matchedKeywords: string[];
}

function stemKeyword(keyword: string, language: string): string {
    const stemmer = language === 'fr' ? natural.PorterStemmerFr : natural.PorterStemmer;
    return stemmer.stem(keyword.toLowerCase());
}

function normalizeKeywords(keywords: string[], language: string): string[] {
    return keywords.map(k => stemKeyword(k, language));
}

// Calculer le poids d'un mot-clé selon sa fréquence dans le doc
function calculateKeywordWeight(
    keyword: string,
    documentText: string,
    documentLength: number
): number {
    // Protection contre ReDoS : limiter la longueur des mots-clés
    if (keyword.length > 100) {
        keyword = keyword.substring(0, 100);
    }

    // Échapper les caractères spéciaux de la regex
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    try {
        const regex = new RegExp(`\\b${escapedKeyword}\\w*\\b`, 'gi');
        const matches = documentText.match(regex);
        const frequency = matches ? matches.length : 0;

        // TF-IDF simplifié : (fréquence du mot / longueur du doc)
        // Plafonné à 0.1 pour éviter qu'un mot très répété domine trop
        return Math.min(frequency / Math.max(documentLength, 1), 0.1);
    } catch (error) {
        // En cas d'erreur regex, retourner 0
        console.error('Erreur lors du calcul du poids du mot-clé:', error);
        return 0;
    }
}

export function scoreAgainstTaxonomy(
    documentKeywords: string[],
    categories: Category[],
    profile?: string,
    language: string = 'fr',
    documentText?: string  // AJOUTÉ: texte complet pour calculer les poids
): ScoreResult[] {
    const scores: ScoreResult[] = [];
    const normalizedDocKeywords = normalizeKeywords(documentKeywords, language);
    const documentLength = documentText ? documentText.split(/\s+/).length : documentKeywords.length;

    for (const category of categories) {
        // Filtrer par profil si spécifié (sauf si "auto")
        if (profile && profile !== 'auto' && !category.profiles.includes(profile)) {
            continue;
        }

        // Normaliser les mots-clés de la catégorie
        const categoryKeywords = normalizeKeywords(category.keywords, language);

        // Calcul de l'intersection
        const intersection = normalizedDocKeywords.filter(k =>
            categoryKeywords.includes(k)
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