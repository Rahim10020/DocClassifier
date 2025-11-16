import { extractKeywords } from './keyword-extractor';
import { scoreAgainstTaxonomy, findBestMatch } from './scorer';
import { getTaxonomyByProfile } from './taxonomy';
import { DocumentClassification, AlternativeCategory } from '@/types/document';
import { Profile } from '@/types/category';
import { SYSTEM_CATEGORIES } from './constants';

export interface ClassificationInput {
    documentId: string;
    text: string;
    language: string;
    profile?: Profile;
}

export async function classifyDocument(
    input: ClassificationInput
): Promise<DocumentClassification> {
    const startTime = Date.now();
    const { documentId, text, language, profile } = input;

    // Log de démarrage
    console.log(`[Classification] Début - Document: ${documentId}, Langue: ${language}, Profil: ${profile || 'auto'}`);

    // Si pas de texte (PDF scanné, image), classifier comme "Images"
    if (!text || text.trim().length === 0) {
        console.log(`[Classification] Document sans texte - ${documentId} (${Date.now() - startTime}ms)`);

        return {
            documentId,
            mainCategory: SYSTEM_CATEGORIES.IMAGES,
            subCategory: 'Documents scannés',
            confidence: 0.6, // Confiance modérée car classification par défaut
            keywords: ['scan', 'image', 'no-text'],
            alternativeCategories: [],
        };
    }

    // 1. Extraction des mots-clés
    const extractStart = Date.now();
    const keywords = extractKeywords(text, {
        language: language as 'fr' | 'en',
        maxKeywords: 30,
    });
    console.log(`[Classification] Extraction de ${keywords.length} mots-clés - ${documentId} (${Date.now() - extractStart}ms)`);

    if (keywords.length === 0) {
        console.log(`[Classification] Aucun mot-clé extrait - ${documentId} (${Date.now() - startTime}ms)`);

        // Texte présent mais pas de mots-clés exploitables
        return {
            documentId,
            mainCategory: SYSTEM_CATEGORIES.UNCATEGORIZED,
            confidence: 0,
            keywords: [],
            alternativeCategories: [],
        };
    }

    // 2. Charger la taxonomie appropriée
    const taxonomyStart = Date.now();
    const taxonomy = getTaxonomyByProfile(profile);
    console.log(`[Classification] Taxonomie chargée: ${taxonomy.length} catégories - ${documentId} (${Date.now() - taxonomyStart}ms)`);

    // 3. Scoring contre la taxonomie
    const scoringStart = Date.now();
    const scores = scoreAgainstTaxonomy(keywords, taxonomy, profile, language, text);
    console.log(`[Classification] Scoring calculé: ${scores.length} scores - ${documentId} (${Date.now() - scoringStart}ms)`);

    // 4. Sélection de la meilleure catégorie
    const bestMatch = findBestMatch(scores);
    console.log(`[Classification] Meilleure catégorie: ${bestMatch.mainCategory} (confiance: ${Math.round(bestMatch.confidence * 100)}%) - ${documentId}`);


    // 5. Construire le résultat
    const alternativeCategories: AlternativeCategory[] = bestMatch.alternatives.map(alt => ({
        categoryId: alt.categoryId,
        categoryName: alt.categoryName,
        subCategory: alt.subCategory,
        score: alt.score,
        matchedKeywords: alt.matchedKeywords,
    }));

    const totalTime = Date.now() - startTime;
    console.log(`[Classification] ✓ Terminé - ${documentId} (TOTAL: ${totalTime}ms)`);

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
    const batchStartTime = Date.now();
    console.log(`[Classification Batch] Début - ${inputs.length} documents à classifier`);

    const results: DocumentClassification[] = [];

    for (const input of inputs) {
        try {
            const classification = await classifyDocument(input);
            results.push(classification);
        } catch (error) {
            console.error(`Error classifying document ${input.documentId}:`, error);
            // En cas d'erreur, marquer comme non classifié plutôt que "Error"
            results.push({
                documentId: input.documentId,
                mainCategory: SYSTEM_CATEGORIES.UNCATEGORIZED,
                confidence: 0,
                keywords: [],
                alternativeCategories: [],
            });
        }
    }

    const batchTotalTime = Date.now() - batchStartTime;
    const avgTime = batchTotalTime / Math.max(inputs.length, 1);
    console.log(`[Classification Batch] ✓ Terminé - ${inputs.length} documents (TOTAL: ${batchTotalTime}ms, Moyenne: ${Math.round(avgTime)}ms/doc)`);

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