import { useState, useEffect, useCallback, useMemo } from 'react';
import { Document } from '@/types/document';
import { Category } from '@/types/category';
import { groupBy } from '@/lib/utils';

interface UseClassificationOptions {
    documents: Document[];
    categories?: Category[];
}

export function useClassification(options: UseClassificationOptions) {
    const { documents, categories = [] } = options;

    const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        category: '',
        fileType: '',
        minConfidence: 0,
        maxConfidence: 1,
    });

    // Grouper les documents par catégorie
    const documentsByCategory = useMemo(() => {
        return groupBy(documents, 'mainCategory');
    }, [documents]);

    // Filtrer les documents selon les critères
    const filteredDocuments = useMemo(() => {
        return documents.filter(doc => {
            // Recherche par nom
            if (searchQuery && !doc.originalName.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            // Filtre par catégorie
            if (filters.category && doc.mainCategory !== filters.category) {
                return false;
            }

            // Filtre par type de fichier
            if (filters.fileType && doc.fileType !== filters.fileType) {
                return false;
            }

            // Filtre par confiance
            if (doc.confidence !== null && doc.confidence !== undefined) {
                if (doc.confidence < filters.minConfidence || doc.confidence > filters.maxConfidence) {
                    return false;
                }
            }

            return true;
        });
    }, [documents, searchQuery, filters]);

    // Statistiques
    const stats = useMemo(() => {
        const total = documents.length;
        const categorized = documents.filter(d => d.mainCategory && d.mainCategory !== 'Uncategorized').length;
        const uncategorized = total - categorized;

        const avgConfidence = documents
            .filter(d => d.confidence !== null && d.confidence !== undefined)
            .reduce((sum, d) => sum + (d.confidence || 0), 0) / Math.max(categorized, 1);

        const categoryDistribution = Object.entries(documentsByCategory).map(([category, docs]) => ({
            category,
            count: docs.length,
            percentage: Math.round((docs.length / total) * 100),
        }));

        return {
            total,
            categorized,
            uncategorized,
            avgConfidence: Math.round(avgConfidence * 100),
            categoryDistribution,
        };
    }, [documents, documentsByCategory]);

    // Sélection de documents
    const toggleDocumentSelection = useCallback((documentId: string) => {
        setSelectedDocuments(prev => {
            const next = new Set(prev);
            if (next.has(documentId)) {
                next.delete(documentId);
            } else {
                next.add(documentId);
            }
            return next;
        });
    }, []);

    const selectAll = useCallback(() => {
        setSelectedDocuments(new Set(filteredDocuments.map(d => d.id)));
    }, [filteredDocuments]);

    const deselectAll = useCallback(() => {
        setSelectedDocuments(new Set());
    }, []);

    const selectByCategory = useCallback((category: string) => {
        const docsInCategory = documents.filter(d => d.mainCategory === category);
        setSelectedDocuments(new Set(docsInCategory.map(d => d.id)));
    }, [documents]);

    // Actions en masse
    const moveSelectedToCategory = useCallback(async (
        newCategory: string,
        newSubCategory?: string
    ) => {
        const updatePromises = Array.from(selectedDocuments).map(docId =>
            fetch('/api/session/update', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    documentId: docId,
                    mainCategory: newCategory,
                    subCategory: newSubCategory,
                }),
            })
        );

        await Promise.all(updatePromises);
        setSelectedDocuments(new Set());
    }, [selectedDocuments]);

    // Obtenir les types de fichiers uniques
    const fileTypes = useMemo(() => {
        return Array.from(new Set(documents.map(d => d.fileType)));
    }, [documents]);

    // Obtenir les catégories présentes
    const presentCategories = useMemo(() => {
        return Array.from(new Set(documents.map(d => d.mainCategory).filter(Boolean)));
    }, [documents]);

    return {
        // Documents
        documents: filteredDocuments,
        documentsByCategory,

        // Recherche et filtres
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,

        // Sélection
        selectedDocuments,
        toggleDocumentSelection,
        selectAll,
        deselectAll,
        selectByCategory,

        // Actions
        moveSelectedToCategory,

        // Statistiques
        stats,

        // Métadonnées
        fileTypes,
        presentCategories,
    };
}