/**
 * @fileoverview Module de gestion de la taxonomie de classification.
 *
 * Ce module charge et gère les 20 catégories de taxonomie JSON utilisées
 * pour classifier les documents. Il fournit des fonctions utilitaires pour
 * accéder aux catégories, sous-catégories et mots-clés associés.
 *
 * Les taxonomies couvrent : académique, administration, créatif, éducation,
 * environnement, événements, finance, santé, immobilier, juridique, marketing,
 * personnel, développement personnel, professionnel, images, facturation,
 * science, technique, transport, et non classifié.
 *
 * @module classification/taxonomy
 * @author DocClassifier Team
 */

import { Category, Profile } from '@/types/category';
import academicData from '@/data/taxonomy/academic.json';
import administrationData from '@/data/taxonomy/administration.json';
import creativeData from '@/data/taxonomy/creative.json';
import educationData from '@/data/taxonomy/education.json';
import environmentalData from '@/data/taxonomy/environnement.json';
import eventsData from '@/data/taxonomy/events.json';
import financialData from '@/data/taxonomy/financial.json';
import healthData from '@/data/taxonomy/health.json';
import realEstateData from '@/data/taxonomy/immobilier.json';
import legalData from '@/data/taxonomy/legal.json';
import marketingData from '@/data/taxonomy/marketing.json';
import personalData from '@/data/taxonomy/personal.json';
import personalDevelopmentData from '@/data/taxonomy/personal-development.json';
import professionalData from '@/data/taxonomy/professional.json';
import imagesData from '@/data/taxonomy/images.json';
import invoicingData from '@/data/taxonomy/invoicing.json';
import scienceData from '@/data/taxonomy/science.json';
import technicalData from '@/data/taxonomy/technical.json';
import transportationData from '@/data/taxonomy/transport.json';
import uncategorizedData from '@/data/taxonomy/uncategorized.json';
import indexData from '@/data/taxonomy/index.json';

/**
 * Dictionnaire regroupant toutes les données de taxonomie importées.
 * Chaque clé correspond à un domaine de classification.
 * @type {Record<string, TaxonomyData>}
 */
const taxonomyData = {
    academic: academicData,
    administration: administrationData,
    creative: creativeData,
    education: educationData,
    environmental: environmentalData,
    events: eventsData,
    financial: financialData,
    health: healthData,
    real_estate: realEstateData,
    images: imagesData,
    invoicing: invoicingData,
    legal: legalData,
    marketing: marketingData,
    personal: personalData,
    personal_development: personalDevelopmentData,
    professional: professionalData,
    science: scienceData,
    technical: technicalData,
    transportation: transportationData,
    uncategorized: uncategorizedData,
};

/**
 * Cache global pour la taxonomie complète.
 * Évite de recharger les données JSON à chaque requête.
 * @type {Category[] | null}
 */
let cachedTaxonomy: Category[] | null = null;

/**
 * Cache des taxonomies filtrées par profil utilisateur.
 * Clé : nom du profil, Valeur : catégories correspondantes.
 * @type {Map<string, Category[]>}
 */
let cachedTaxonomyByProfile: Map<string, Category[]> = new Map();

/**
 * Charge et transforme toutes les taxonomies JSON en objets Category.
 *
 * Cette fonction est appelée une seule fois, les appels suivants
 * retournent le cache pour optimiser les performances.
 *
 * @function loadTaxonomy
 * @returns {Category[]} Tableau de toutes les catégories avec leurs sous-catégories
 *
 * @example
 * const categories = loadTaxonomy();
 * console.log(categories.length); // 20 catégories
 */
export function loadTaxonomy(): Category[] {
    // Retourner le cache si disponible
    if (cachedTaxonomy) {
        return cachedTaxonomy;
    }

    const categories: Category[] = [];

    for (const [, data] of Object.entries(taxonomyData)) {
        const category: Category = {
            id: data.id,
            name: data.name,
            nameEn: data.nameEn,
            profiles: data.profiles,
            keywords: data.keywords,
            priority: data.priority,
            icon: data.icon,
            color: data.color,
            children: data.subcategories?.map(sub => ({
                id: sub.id,
                name: sub.name,
                nameEn: sub.nameEn,
                parentId: data.id,
                profiles: data.profiles,
                keywords: sub.keywords,
                priority: data.priority,
                children: [],
            })) || [],
        };

        categories.push(category);
    }

    // Mettre en cache
    cachedTaxonomy = categories;
    return categories;
}

/**
 * Récupère les catégories de taxonomie filtrées par profil utilisateur.
 *
 * Les profils permettent d'adapter la classification au contexte :
 * - 'student' : catégories académiques prioritaires
 * - 'professional' : catégories business et administratives
 * - 'researcher' : catégories scientifiques et techniques
 * - 'personal' : catégories personnelles et loisirs
 * - 'auto' ou undefined : toutes les catégories
 *
 * @function getTaxonomyByProfile
 * @param {Profile} [profile] - Profil utilisateur pour filtrer les catégories
 * @returns {Category[]} Catégories correspondant au profil (ou toutes si 'auto')
 *
 * @example
 * const studentCategories = getTaxonomyByProfile('student');
 * const allCategories = getTaxonomyByProfile('auto');
 */
export function getTaxonomyByProfile(profile?: Profile): Category[] {
    // Utiliser le cache par profil
    const cacheKey = profile || 'auto';
    if (cachedTaxonomyByProfile.has(cacheKey)) {
        return cachedTaxonomyByProfile.get(cacheKey)!;
    }

    const allCategories = loadTaxonomy();

    if (!profile || profile === 'auto') {
        cachedTaxonomyByProfile.set(cacheKey, allCategories);
        return allCategories;
    }

    const filtered = allCategories.filter(category =>
        category.profiles.includes(profile)
    );

    cachedTaxonomyByProfile.set(cacheKey, filtered);
    return filtered;
}

/**
 * Recherche une catégorie par son identifiant unique.
 *
 * @function getCategoryById
 * @param {string} categoryId - Identifiant de la catégorie à rechercher
 * @returns {Category | null} La catégorie trouvée ou null si inexistante
 *
 * @example
 * const category = getCategoryById('financial');
 * if (category) {
 *   console.log(category.name); // 'Documents financiers'
 * }
 */
export function getCategoryById(categoryId: string): Category | null {
    const categories = loadTaxonomy();
    return categories.find(cat => cat.id === categoryId) || null;
}

/**
 * Recherche une sous-catégorie par ses identifiants parent et enfant.
 *
 * @function getSubcategoryById
 * @param {string} categoryId - Identifiant de la catégorie parente
 * @param {string} subcategoryId - Identifiant de la sous-catégorie
 * @returns {Category | null} La sous-catégorie trouvée ou null
 *
 * @example
 * const subcat = getSubcategoryById('financial', 'invoices');
 */
export function getSubcategoryById(categoryId: string, subcategoryId: string): Category | null {
    const category = getCategoryById(categoryId);
    if (!category || !category.children) return null;

    return category.children.find(sub => sub.id === subcategoryId) || null;
}

/**
 * Récupère tous les mots-clés uniques de toutes les catégories et sous-catégories.
 *
 * Utile pour l'analyse statistique ou la construction d'index de recherche.
 *
 * @function getAllKeywords
 * @returns {string[]} Tableau de tous les mots-clés uniques de la taxonomie
 *
 * @example
 * const keywords = getAllKeywords();
 * console.log(keywords.length); // Nombre total de mots-clés uniques
 */
export function getAllKeywords(): string[] {
    const categories = loadTaxonomy();
    const keywords = new Set<string>();

    categories.forEach(category => {
        category.keywords.forEach(kw => keywords.add(kw));

        if (category.children) {
            category.children.forEach(sub => {
                sub.keywords.forEach(kw => keywords.add(kw));
            });
        }
    });

    return Array.from(keywords);
}

/**
 * Récupère les informations sur les profils disponibles.
 *
 * @function getProfileInfo
 * @returns {ProfileInfo[]} Tableau des profils avec leurs métadonnées
 */
export function getProfileInfo() {
    return indexData.profiles;
}

/**
 * Récupère les couleurs associées à chaque catégorie.
 *
 * Les couleurs sont utilisées pour l'affichage dans l'interface utilisateur
 * (badges, icônes, graphiques).
 *
 * @function getCategoryColors
 * @returns {Record<string, string>} Dictionnaire categoryId → couleur hex
 *
 * @example
 * const colors = getCategoryColors();
 * console.log(colors['financial']); // '#4CAF50'
 */
export function getCategoryColors(): Record<string, string> {
    const categories = loadTaxonomy();
    const colors: Record<string, string> = {};

    categories.forEach(category => {
        if (category.color) {
            colors[category.id] = category.color;
        }
    });

    return colors;
}

/**
 * Aplatit la taxonomie hiérarchique en une liste linéaire.
 *
 * Les sous-catégories sont incluses avec un nom formaté
 * "Catégorie > Sous-catégorie" pour faciliter l'affichage.
 *
 * @function flattenTaxonomy
 * @returns {Category[]} Liste plate de toutes les catégories et sous-catégories
 *
 * @example
 * const flat = flattenTaxonomy();
 * // Inclut "Finance" et "Finance > Factures"
 */
export function flattenTaxonomy(): Category[] {
    const categories = loadTaxonomy();
    const flattened: Category[] = [];

    categories.forEach(category => {
        flattened.push(category);

        if (category.children) {
            category.children.forEach(sub => {
                flattened.push({
                    ...sub,
                    name: `${category.name} > ${sub.name}`,
                    nameEn: category.nameEn && sub.nameEn ? `${category.nameEn} > ${sub.nameEn}` : undefined,
                });
            });
        }
    });

    return flattened;
}