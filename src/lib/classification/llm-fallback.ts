/**
 * Stub LLM fallback module
 *
 * Fournit une fonction pour suggérer une catégorie via un LLM (zero-shot)
 * Ce module est volontairement léger et ne contacte aucun service externe
 * tant que l'option n'est pas activée via l'env var ENABLE_LLM_FALLBACK.
 *
 * Implémentation recommandée plus tard : utiliser OpenAI / Anthropic API
 * et des prompts structurés pour retourner { suggestedCategory, explanation, confidence }.
 */

export interface LLMSuggestion {
    suggestedCategory: string;
    explanation?: string;
    confidence?: number; // 0-1 estimation
}

/**
 * Suggest a category for a free text using an LLM (zero-shot).
 * If LLM fallback is disabled, returns null.
 *
 * WARNING: This is a stub. Enable by setting ENABLE_LLM_FALLBACK=true and
 * then implement the actual API calls.
 */
export async function suggestCategoryWithLLM(text: string, _taxonomySample?: string[]): Promise<LLMSuggestion | null> {
    const enabled = process.env.ENABLE_LLM_FALLBACK === 'true';

    if (!enabled) return null;

    // Minimal heuristic fallback when enabled but no API implemented:
    // - Take first sentence, extract a few nouns-like tokens, and return a short label.
    try {
        const snippet = text.split('\n')[0] || text;
        const words = snippet
            .toLowerCase()
            .replace(/[^a-z0-9àâäéèêëïîôùûüÿæœç\s]/gi, ' ')
            .split(/\s+/)
            .filter(w => w.length > 3);

        const top = words.slice(0, 3).map(w => w.replace(/ing$|ment$|tion$|s$/i, '')).join(' ');

        return {
            suggestedCategory: top ? `${top}` : 'Autre',
            explanation: 'Heuristic fallback (no real LLM configured)',
            confidence: 0.3,
        };
    } catch (err) {
        console.error('LLM fallback heuristic failed:', err);
        return null;
    }
}
