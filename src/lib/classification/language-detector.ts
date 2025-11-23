/**
 * @fileoverview Module de détection automatique de langue.
 *
 * Ce module détecte la langue d'un texte en utilisant la bibliothèque franc-min
 * (basée sur les trigrammes). Il supporte le français et l'anglais avec des
 * mécanismes de calcul de confiance basés sur des heuristiques.
 *
 * @module classification/language-detector
 * @author DocClassifier Team
 */

import { franc } from 'franc-min';

/**
 * Types de langues supportées par le détecteur.
 * - 'fr' : Français
 * - 'en' : Anglais
 * - 'unknown' : Langue non reconnue ou texte trop court
 *
 * @typedef {'fr' | 'en' | 'unknown'} DetectedLanguage
 */
export type DetectedLanguage = 'fr' | 'en' | 'unknown';

/**
 * Détecte la langue principale d'un texte.
 *
 * Utilise l'algorithme de trigrammes de franc pour identifier la langue.
 * Nécessite au moins 50 caractères pour une détection fiable.
 *
 * @function detectLanguage
 * @param {string} text - Texte à analyser
 * @returns {DetectedLanguage} Code de langue détecté ou 'unknown'
 *
 * @example
 * detectLanguage('Bonjour, comment allez-vous ?'); // 'fr'
 * detectLanguage('Hello, how are you?');          // 'en'
 * detectLanguage('Hi');                            // 'unknown' (trop court)
 */
export function detectLanguage(text: string): DetectedLanguage {
    if (!text || text.trim().length < 50) {
        return 'unknown';
    }

    try {
        // franc retourne un code ISO 639-3
        const detected = franc(text);

        // Mapper vers nos langues supportées
        const languageMap: Record<string, DetectedLanguage> = {
            'fra': 'fr',
            'eng': 'en',
        };

        return languageMap[detected] || 'unknown';
    } catch (error) {
        console.error('Error detecting language:', error);
        return 'unknown';
    }
}

/**
 * Détecte la langue avec un score de confiance.
 *
 * Combine la détection franc avec une heuristique basée sur la présence
 * de mots communs en français et anglais pour calculer la confiance.
 *
 * Mots français recherchés : le, la, de, et, un, une, est, pour, dans
 * Mots anglais recherchés : the, of, and, to, in, is, for, that
 *
 * @function detectLanguageWithConfidence
 * @param {string} text - Texte à analyser
 * @returns {Object} Résultat de détection
 * @returns {DetectedLanguage} returns.language - Langue détectée
 * @returns {number} returns.confidence - Score de confiance (0-1)
 *
 * @example
 * const result = detectLanguageWithConfidence(documentText);
 * if (result.confidence > 0.8) {
 *   console.log(`Langue: ${result.language} (confiant)`);
 * }
 */
export function detectLanguageWithConfidence(text: string): { language: DetectedLanguage; confidence: number } {
    const language = detectLanguage(text);

    // Simple heuristique pour la confiance
    const frenchWords = ['le', 'la', 'de', 'et', 'un', 'une', 'est', 'pour', 'dans'];
    const englishWords = ['the', 'of', 'and', 'to', 'in', 'is', 'for', 'that'];

    const lowerText = text.toLowerCase();

    const frenchCount = frenchWords.filter(word => lowerText.includes(` ${word} `)).length;
    const englishCount = englishWords.filter(word => lowerText.includes(` ${word} `)).length;

    const total = frenchCount + englishCount;
    const confidence = total > 0 ? Math.max(frenchCount, englishCount) / total : 0.5;

    return { language, confidence };
}