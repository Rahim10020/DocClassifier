/**
 * @fileoverview Types pour les catégories et profils de classification.
 *
 * @module types/category
 * @author DocClassifier Team
 */

/**
 * Catégorie de classification avec ses métadonnées.
 * @interface Category
 */
export interface Category {
    id: string;
    name: string;
    nameEn?: string;
    parentId?: string;
    profiles: string[];
    keywords: string[];
    priority: number;
    icon?: string;
    color?: string;
    children?: Category[];
}

/**
 * Catégorie avec comptage de documents.
 * @interface CategoryWithCount
 */
export interface CategoryWithCount extends Category {
    documentCount: number;
}

/**
 * Catégorie dans une structure arborescente.
 * @interface CategoryTree
 */
export interface CategoryTree extends Category {
    children: CategoryTree[];
    level: number;
    expanded?: boolean;
}

/**
 * Sous-catégorie d'une catégorie parente.
 * @interface Subcategory
 */
export interface Subcategory {
    id: string;
    name: string;
    nameEn?: string;
    keywords: string[];
    parentId: string;
}

/**
 * Profils de classification disponibles.
 * @typedef {string} Profile
 */
export type Profile = 'student' | 'professional' | 'researcher' | 'personal' | 'auto';

/**
 * Option de profil avec métadonnées d'affichage.
 * @interface ProfileOption
 */
export interface ProfileOption {
    id: Profile;
    name: string;
    nameEn: string;
    icon: string;
    description: string;
    descriptionEn: string;
}