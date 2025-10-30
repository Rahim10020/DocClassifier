import natural from 'natural';
import { Category } from '@/types/category';

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

export function scoreAgainstTaxonomy(
    documentKeywords: string[],
    categories: Category[],
    profile?: string,
    language: string = 'fr'
): ScoreResult[] {
    const scores: ScoreResult[] = [];
    const normalizedDocKeywords = normalizeKeywords(documentKeywords, language);

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

        // Score = (mots communs / total mots doc) * (priorité catégorie / 100)
        const baseScore = intersection.length / Math.max(normalizedDocKeywords.length, 1);
        const priorityBonus = category.priority / 100;
        const score = baseScore * priorityBonus;

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
                    language
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
    language: string = 'fr'
): number {
    const subKeywords = normalizeKeywords(subCategory.keywords, language);
    const intersection = documentKeywords.filter(k => subKeywords.includes(k));

    if (intersection.length === 0) return 0;

    // Score plus élevé pour les sous-catégories car plus spécifiques
    return (intersection.length / Math.max(documentKeywords.length, 1)) * 1.2;
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
            mainCategory: 'Uncategorized',
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