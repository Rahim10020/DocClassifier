/**
 * @fileoverview Module principal de classification de documents.
 *
 * Ce module orchestre le processus complet de classification automatique des documents
 * en utilisant des algorithmes NLP (extraction de mots-clés, scoring TF-IDF).
 *
 * @module classification/classifier
 * @author DocClassifier Team
 */

import { extractKeywords } from './keyword-extractor';
import { scoreAgainstTaxonomy, findBestMatch } from './scorer';
import { getTaxonomyByProfile } from './taxonomy';
import { DocumentClassification, AlternativeCategory } from '@/types/document';
import { Profile } from '@/types/category';
import { SYSTEM_CATEGORIES } from './constants';

/**
 * Interface définissant les données d'entrée pour la classification d'un document.
 *
 * @interface ClassificationInput
 * @property {string} documentId - Identifiant unique du document à classifier
 * @property {string} text - Contenu textuel extrait du document
 * @property {string} language - Code de langue détectée ('fr' ou 'en')
 * @property {Profile} [profile] - Profil de classification optionnel (student, professional, etc.)
 */
export interface ClassificationInput {
    documentId: string;
    text: string;
    language: string;
    profile?: Profile;
}

/**
 * Classifie un document unique en analysant son contenu textuel.
 *
 * Le processus de classification suit les étapes suivantes :
 * 1. Vérification du texte (documents sans texte → catégorie "Images")
 * 2. Extraction des mots-clés via NLP
 * 3. Chargement de la taxonomie appropriée selon le profil
 * 4. Scoring contre toutes les catégories
 * 5. Sélection de la meilleure correspondance avec calcul de confiance
 *
 * @async
 * @function classifyDocument
 * @param {ClassificationInput} input - Données d'entrée du document à classifier
 * @returns {Promise<DocumentClassification>} Résultat de classification avec catégorie, confiance et alternatives
 *
 * @example
 * const result = await classifyDocument({
 *   documentId: 'doc-123',
 *   text: 'Contenu du document...',
 *   language: 'fr',
 *   profile: 'student'
 * });
 * console.log(result.mainCategory); // 'Documents académiques'
 */
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
    let keywords: string[] = [];

    try {
        keywords = extractKeywords(text, {
            language: language as 'fr' | 'en',
            maxKeywords: 30,
        });
        console.log(`[Classification] Extraction de ${keywords.length} mots-clés - ${documentId} (${Date.now() - extractStart}ms)`);
    } catch (extractError) {
        console.error(`[Classification] Erreur extraction mots-clés - ${documentId}:`, extractError);
        keywords = [];
    }

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
    let taxonomy;

    try {
        taxonomy = getTaxonomyByProfile(profile);
        console.log(`[Classification] Taxonomie chargée: ${taxonomy.length} catégories - ${documentId} (${Date.now() - taxonomyStart}ms)`);

        if (!taxonomy || taxonomy.length === 0) {
            throw new Error('Taxonomie vide ou non disponible');
        }
    } catch (taxonomyError) {
        console.error(`[Classification] Erreur chargement taxonomie - ${documentId}:`, taxonomyError);
        return {
            documentId,
            mainCategory: SYSTEM_CATEGORIES.UNCATEGORIZED,
            confidence: 0,
            keywords: [],
            alternativeCategories: [],
        };
    }

    // 3. Scoring contre la taxonomie
    const scoringStart = Date.now();
    let scores;

    try {
        scores = scoreAgainstTaxonomy(keywords, taxonomy, profile, language, text);
        console.log(`[Classification] Scoring calculé: ${scores.length} scores - ${documentId} (${Date.now() - scoringStart}ms)`);
    } catch (scoringError) {
        console.error(`[Classification] Erreur lors du scoring - ${documentId}:`, scoringError);
        scores = [];
    }

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

/**
 * Classifie un lot de documents de manière séquentielle.
 *
 * Traite chaque document individuellement et agrège les résultats.
 * En cas d'erreur sur un document, celui-ci est marqué comme "Non classifié"
 * plutôt que de faire échouer le lot entier.
 *
 * @async
 * @function classifyDocuments
 * @param {ClassificationInput[]} inputs - Tableau des documents à classifier
 * @returns {Promise<DocumentClassification[]>} Tableau des résultats de classification
 *
 * @example
 * const results = await classifyDocuments([
 *   { documentId: 'doc-1', text: '...', language: 'fr' },
 *   { documentId: 'doc-2', text: '...', language: 'en' }
 * ]);
 */
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

/**
 * Reclassifie un document avec un nouveau profil.
 *
 * Permet de relancer la classification d'un document existant
 * en utilisant un profil différent pour obtenir des résultats plus adaptés.
 *
 * @function reclassifyDocument
 * @param {string} documentId - Identifiant du document à reclassifier
 * @param {string} text - Contenu textuel du document
 * @param {string} language - Code de langue du document
 * @param {Profile} [newProfile] - Nouveau profil à utiliser pour la classification
 * @returns {Promise<DocumentClassification>} Nouveau résultat de classification
 *
 * @example
 * const newResult = await reclassifyDocument('doc-123', text, 'fr', 'professional');
 */
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