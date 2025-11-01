import { extractKeywords } from './keyword-extractor';
import { scoreAgainstTaxonomy, findBestMatch } from './scorer';
import { getTaxonomyByProfile } from './taxonomy';
import { DocumentClassification, AlternativeCategory } from '@/types/document';
import { Profile } from '@/types/category';

export interface ClassificationInput {
    documentId: string;
    text: string;
    language: string;
    profile?: Profile;
}

export async function classifyDocument(
    input: ClassificationInput
): Promise<DocumentClassification> {
    const { documentId, text, language, profile } = input;



    // Si pas de texte (PDF scanné, image), classifier comme "Images"
    if (!text || text.trim().length === 0) {
        return {
            documentId,
            mainCategory: 'Images et Scans',
            subCategory: 'Documents scannés',
            confidence: 0.95,
            keywords: ['scan', 'image', 'no-text'],
            alternativeCategories: [],
        };
    }

    // 1. Extraction des mots-clés
    const keywords = extractKeywords(text, {
        language: language as 'fr' | 'en',
        maxKeywords: 30,
    });

    if (keywords.length === 0) {
        // Texte présent mais pas de mots-clés exploitables
        return {
            documentId,
            mainCategory: 'Uncategorized',
            confidence: 0,
            keywords: [],
            alternativeCategories: [],
        };
    }

    // 2. Charger la taxonomie appropriée
    const taxonomy = getTaxonomyByProfile(profile);

    // 3. Scoring contre la taxonomie
    const scores = scoreAgainstTaxonomy(keywords, taxonomy, profile, language);

    // 4. Sélection de la meilleure catégorie
    const bestMatch = findBestMatch(scores);

    // 5. Construire le résultat
    const alternativeCategories: AlternativeCategory[] = bestMatch.alternatives.map(alt => ({
        categoryId: alt.categoryId,
        categoryName: alt.categoryName,
        subCategory: alt.subCategory,
        score: alt.score,
        matchedKeywords: alt.matchedKeywords,
    }));

    return {
        documentId,
        mainCategory: bestMatch.mainCategory,
        subCategory: bestMatch.subCategory,
        confidence: bestMatch.confidence,
        keywords: keywords.slice(0, 10), // Top 10 keywords
        alternativeCategories,
    };
}

export async function classifyDocuments(
    inputs: ClassificationInput[]
): Promise<DocumentClassification[]> {
    const results: DocumentClassification[] = [];

    for (const input of inputs) {
        try {
            const classification = await classifyDocument(input);
            results.push(classification);
        } catch (error) {
            console.error(`Error classifying document ${input.documentId}:`, error);
            results.push({
                documentId: input.documentId,
                mainCategory: 'Error',
                confidence: 0,
                keywords: [],
                alternativeCategories: [],
            });
        }
    }

    return results;
}

export function reclassifyDocument(
    documentId: string,
    text: string,
    language: string,
    newProfile?: Profile
): Promise<DocumentClassification> {
    return classifyDocument({
        documentId,
        text,
        language,
        profile: newProfile,
    });
}