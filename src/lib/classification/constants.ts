/**
 * Catégories système - correspondent aux noms dans la taxonomie
 * Ces catégories sont utilisées par défaut quand la classification échoue
 * ou pour des cas spéciaux (documents sans texte, etc.)
 */
export const SYSTEM_CATEGORIES = {
    IMAGES: 'Images et Scans',
    UNCATEGORIZED: 'Non classifié',
} as const;

export type SystemCategory = typeof SYSTEM_CATEGORIES[keyof typeof SYSTEM_CATEGORIES];
