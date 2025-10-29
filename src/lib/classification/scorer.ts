
interface ScoreResult {
    categoryId: string;
    categoryName: string;
    subCategory?: string;
    score: number;
    matchedKeywords: string[];
}

function scoreAgainstTaxonomy(
    documentKeywords: string[],
    categories: Category[],
    profile?: string
): ScoreResult[] {
    const scores: ScoreResult[] = [];

    for (const category of categories) {
        // Filtrer par profil si spécifié
        if (profile && !category.profile.includes(profile)) {
            continue;
        }

        // Calcul similarité (intersection de mots-clés)
        const categoryKeywords = category.keywords.map(k => stem(k));
        const intersection = documentKeywords.filter(k =>
            categoryKeywords.includes(k)
        );

        // Score = (mots communs / total mots doc) * priorité catégorie
        const score = (intersection.length / documentKeywords.length)
            * (category.priority / 100);

        if (score > 0) {
            scores.push({
                categoryId: category.id,
                categoryName: category.name,
                score,
                matchedKeywords: intersection
            });

            // Tester sous-catégories
            for (const subCat of category.children) {
                const subScore = calculateSubCategoryScore(
                    documentKeywords,
                    subCat
                );
                if (subScore > score * 0.5) {
                    scores.push({
                        categoryId: category.id,
                        categoryName: category.name,
                        subCategory: subCat.name,
                        score: subScore,
                        matchedKeywords: intersection
                    });
                }
            }
        }
    }

    // Trier par score décroissant
    return scores.sort((a, b) => b.score - a.score);
}