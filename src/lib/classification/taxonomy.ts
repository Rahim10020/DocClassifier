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
import scienceData from '@/data/taxonomy/science.json';
import technicalData from '@/data/taxonomy/technical.json';
import transportationData from '@/data/taxonomy/transport.json';
import indexData from '@/data/taxonomy/index.json';

// Charger toutes les taxonomies
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
    legal: legalData,
    marketing: marketingData,
    personal: personalData,
    personal_development: personalDevelopmentData,
    professional: professionalData,
    science: scienceData,
    technical: technicalData,
    transportation: transportationData,
};

export function loadTaxonomy(): Category[] {
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

    return categories;
}

export function getTaxonomyByProfile(profile?: Profile): Category[] {
    const allCategories = loadTaxonomy();

    if (!profile || profile === 'auto') {
        return allCategories;
    }

    return allCategories.filter(category =>
        category.profiles.includes(profile)
    );
}

export function getCategoryById(categoryId: string): Category | null {
    const categories = loadTaxonomy();
    return categories.find(cat => cat.id === categoryId) || null;
}

export function getSubcategoryById(categoryId: string, subcategoryId: string): Category | null {
    const category = getCategoryById(categoryId);
    if (!category || !category.children) return null;

    return category.children.find(sub => sub.id === subcategoryId) || null;
}

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

export function getProfileInfo() {
    return indexData.profiles;
}

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