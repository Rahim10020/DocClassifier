
async function classifyDocument(
    document: Document,
    taxonomy: Category[],
    profile?: string
): Promise<Classification> {
    // 1. Extraction mots-clés
    const keywords = extractKeywords(
        document.extractedText,
        document.language
    );

    // 2. Scoring
    const scores = scoreAgainstTaxonomy(keywords, taxonomy, profile);

    // 3. Sélection meilleure catégorie
    const best = scores[0];

    // 4. Calcul confiance
    const confidence = best.score > 0.7 ? best.score : 0.5;

    return {
        mainCategory: best.categoryName,
        subCategory: best.subCategory,
        confidence,
        keywords: keywords.slice(0, 10), // Top 10
        alternativeCategories: scores.slice(1, 4) // Top 3 alternatives
    };
}