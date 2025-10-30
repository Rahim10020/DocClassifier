import { franc } from 'franc-min';

export type DetectedLanguage = 'fr' | 'en' | 'unknown';

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