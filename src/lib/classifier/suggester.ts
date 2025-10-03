import { TFIDFClassifier } from './tfidf';
import { getCategorySuggestions as getDBCategorySuggestions } from '@/lib/db/queries/categories';

/**
 * Category suggestion engine that combines multiple approaches
 */
export class CategorySuggester {
    private tfidfClassifier: TFIDFClassifier;
    private keywordPatterns: Map<string, RegExp[]>;

    constructor() {
        this.tfidfClassifier = new TFIDFClassifier();
        this.keywordPatterns = this.initializeKeywordPatterns();
    }

    /**
     * Initialize keyword patterns for common document categories
     */
    private initializeKeywordPatterns(): Map<string, RegExp[]> {
        return new Map([
            ['Invoices', [
                /invoice|facture|bill|receipt/i,
                /amount|total|due|payment/i,
                /customer|client|vendor|supplier/i,
            ]],
            ['Contracts', [
                /contract|agreement|terms|conditions/i,
                /party|parties|signature|signed/i,
                /effective|termination|renewal/i,
            ]],
            ['Reports', [
                /report|analysis|summary|overview/i,
                /data|statistics|findings|conclusion/i,
                /executive|annual|monthly|quarterly/i,
            ]],
            ['Correspondence', [
                /email|letter|memo|correspondence/i,
                /from|to|subject|regarding/i,
                /dear|sincerely|best regards/i,
            ]],
            ['Financial', [
                /financial|budget|forecast|projection/i,
                /revenue|expense|profit|loss/i,
                /balance|income|cash flow/i,
            ]],
            ['Legal', [
                /legal|law|regulation|compliance/i,
                /attorney|lawyer|counsel|court/i,
                /agreement|contract|license/i,
            ]],
            ['Technical', [
                /technical|specification|documentation/i,
                /system|software|hardware|network/i,
                /implementation|deployment|configuration/i,
            ]],
            ['Marketing', [
                /marketing|advertising|promotion|campaign/i,
                /brand|customer|audience|target/i,
                /strategy|plan|content|social media/i,
            ]],
            ['HR', [
                /hr|human resources|employee|staff/i,
                /hiring|recruitment|training|performance/i,
                /policy|procedure|handbook|benefits/i,
            ]],
            ['Medical', [
                /medical|health|patient|clinical/i,
                /diagnosis|treatment|medication|therapy/i,
                /hospital|clinic|doctor|physician/i,
            ]],
        ]);
    }

    /**
     * Add training document for category learning
     */
    addTrainingDocument(documentId: string, text: string, category?: string): void {
        this.tfidfClassifier.addDocument(documentId, text, category);
    }

    /**
     * Suggest categories for a document based on its content
     */
    async suggestCategories(
        text: string,
        classificationId?: string,
        maxSuggestions: number = 5
    ): Promise<Array<{
        category: string;
        confidence: number;
        reason: string;
    }>> {
        const suggestions: Array<{
            category: string;
            confidence: number;
            reason: string;
        }> = [];

        // 1. Pattern-based suggestions
        const patternSuggestions = this.getPatternBasedSuggestions(text);
        suggestions.push(...patternSuggestions);

        // 2. TF-IDF based suggestions
        const tfidfResults = this.tfidfClassifier.classifyDocument(text);
        const tfidfSuggestions = this.getTFIDFSuggestions(text, tfidfResults);
        suggestions.push(...tfidfSuggestions);

        // 3. Database-driven suggestions (if classificationId provided)
        if (classificationId) {
            const dbSuggestions = await this.getDatabaseSuggestions(classificationId);
            suggestions.push(...dbSuggestions);
        }

        // 4. Keyword extraction for new category suggestions
        const keywordSuggestions = this.getKeywordBasedSuggestions(text);
        suggestions.push(...keywordSuggestions);

        // Remove duplicates and sort by confidence
        const uniqueSuggestions = this.deduplicateSuggestions(suggestions);

        return uniqueSuggestions
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, maxSuggestions);
    }

    /**
     * Get pattern-based category suggestions
     */
    private getPatternBasedSuggestions(text: string): Array<{
        category: string;
        confidence: number;
        reason: string;
    }> {
        const suggestions: Array<{
            category: string;
            confidence: number;
            reason: string;
        }> = [];

        for (const [category, patterns] of this.keywordPatterns.entries()) {
            let matchCount = 0;
            const matchedPatterns: string[] = [];

            for (const pattern of patterns) {
                if (pattern.test(text)) {
                    matchCount++;
                    matchedPatterns.push(pattern.source);
                }
            }

            if (matchCount > 0) {
                const confidence = Math.min(0.9, matchCount / patterns.length);
                suggestions.push({
                    category,
                    confidence,
                    reason: `Matches ${matchCount} pattern(s): ${matchedPatterns.join(', ')}`,
                });
            }
        }

        return suggestions;
    }

    /**
     * Get TF-IDF based suggestions
     */
    private getTFIDFSuggestions(
        text: string,
        tfidfResults: Array<{ documentId: string; similarity: number }>
    ): Array<{
        category: string;
        confidence: number;
        reason: string;
    }> {
        if (tfidfResults.length === 0) return [];

        const topResult = tfidfResults[0];
        const confidence = this.tfidfClassifier.getConfidenceScore(tfidfResults);

        return [{
            category: `Similar to document ${topResult.documentId}`,
            confidence,
            reason: `TF-IDF similarity score: ${(topResult.similarity * 100).toFixed(1)}%`,
        }];
    }

    /**
     * Get database-driven suggestions
     */
    private async getDatabaseSuggestions(classificationId: string): Promise<Array<{
        category: string;
        confidence: number;
        reason: string;
    }>> {
        try {
            const existingCategories = await getDBCategorySuggestions(classificationId, 10);

            return existingCategories.map((category, index) => ({
                category,
                confidence: Math.max(0.3, 0.8 - (index * 0.1)), // Decay confidence by position
                reason: 'Based on existing classification patterns',
            }));
        } catch (error) {
            console.error('Error getting database suggestions:', error);
            return [];
        }
    }

    /**
     * Get keyword-based suggestions for new categories
     */
    private getKeywordBasedSuggestions(text: string): Array<{
        category: string;
        confidence: number;
        reason: string;
    }> {
        const keywords = this.tfidfClassifier.extractKeywords(text, 5);

        if (keywords.length === 0) return [];

        const topKeywords = keywords.slice(0, 3);
        const keywordText = topKeywords.map(kw => kw.word).join(' ');

        // Generate category name from keywords
        const categoryName = this.generateCategoryFromKeywords(topKeywords);

        return [{
            category: categoryName,
            confidence: Math.min(0.7, topKeywords[0]?.score || 0),
            reason: `Based on keywords: ${keywordText}`,
        }];
    }

    /**
     * Generate category name from extracted keywords
     */
    private generateCategoryFromKeywords(keywords: Array<{ word: string; score: number }>): string {
        if (keywords.length === 0) return 'General';

        const topKeyword = keywords[0].word;

        // Capitalize first letter and handle common cases
        return topKeyword.charAt(0).toUpperCase() + topKeyword.slice(1).toLowerCase();
    }

    /**
     * Remove duplicate suggestions and combine confidences
     */
    private deduplicateSuggestions(suggestions: Array<{
        category: string;
        confidence: number;
        reason: string;
    }>): Array<{
        category: string;
        confidence: number;
        reason: string;
    }> {
        const categoryMap = new Map<string, {
            confidence: number;
            reasons: string[];
        }>();

        for (const suggestion of suggestions) {
            const existing = categoryMap.get(suggestion.category);

            if (existing) {
                // Combine confidences (weighted average)
                const combinedConfidence = Math.max(existing.confidence, suggestion.confidence);
                existing.confidence = combinedConfidence;
                existing.reasons.push(suggestion.reason);
            } else {
                categoryMap.set(suggestion.category, {
                    confidence: suggestion.confidence,
                    reasons: [suggestion.reason],
                });
            }
        }

        return Array.from(categoryMap.entries()).map(([category, data]) => ({
            category,
            confidence: data.confidence,
            reason: data.reasons.slice(0, 2).join('; '), // Limit to top 2 reasons
        }));
    }

    /**
     * Train the suggester with a batch of documents
     */
    async trainWithDocuments(documents: Array<{
        id: string;
        text: string;
        category?: string;
    }>): Promise<void> {
        for (const doc of documents) {
            this.addTrainingDocument(doc.id, doc.text, doc.category);
        }
    }

    /**
     * Get training statistics
     */
    getTrainingStats(): {
        vocabularySize: number;
        documentCount: number;
        categories: string[];
    } {
        return {
            vocabularySize: this.tfidfClassifier.getVocabularySize(),
            documentCount: this.tfidfClassifier.getDocumentCount(),
            categories: Array.from(this.keywordPatterns.keys()),
        };
    }

    /**
     * Reset the suggester
     */
    reset(): void {
        this.tfidfClassifier.clear();
    }
}

// Export singleton instance
export const categorySuggester = new CategorySuggester();