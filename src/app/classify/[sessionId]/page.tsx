'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { Header } from '@/components/shared/Header';
import { SearchBar } from '@/components/classify/SearchBar';
import { CategoryTree } from '@/components/classify/CategoryTree';
import { CategoryColumn } from '@/components/classify/CategoryColumn';
import { DocumentCard } from '@/components/classify/DocumentCard';
import { FilterPanel } from '@/components/classify/FilterPanel';
import { BulkActions } from '@/components/classify/BulkActions';
import { DownloadButton } from '@/components/download/DownloadButton';
import { FilePreview } from '@/components/upload/FilePreview';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSession } from '@/hooks/useSession';
import { useClassification } from '@/hooks/useClassification';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { Document, DocumentPreview } from '@/types/document';
import { Category } from '@/types/category';
import { Filter, BarChart3 } from 'lucide-react';

export default function ClassifyPage() {
    const params = useParams();
    const router = useRouter();
    const sessionId = params.sessionId as string;

    const { session, documents, isLoading, error, updateDocument } = useSession({
        sessionId,
        autoRefresh: false,
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [previewDocument, setPreviewDocument] = useState<DocumentPreview | null>(null);

    const {
        documents: filteredDocuments,
        documentsByCategory,
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        selectedDocuments,
        toggleDocumentSelection,
        selectAll,
        deselectAll,
        moveSelectedToCategory,
        stats,
        fileTypes,
        presentCategories,
    } = useClassification({ documents });

    const handleDocumentMove = async (
        documentId: string,
        newCategory: string,
        newSubCategory?: string
    ) => {
        await updateDocument(documentId, {
            mainCategory: newCategory,
            subCategory: newSubCategory,
        });
    };

    const {
        sensors,
        activeId,
        activeDocument,
        isDragging,
        handleDragStart,
        handleDragEnd,
        handleDragCancel,
    } = useDragAndDrop({
        documents: filteredDocuments,
        onDocumentMove: handleDocumentMove,
    });

    //  Charger la taxonomie via API
    useEffect(() => {
        const fetchTaxonomy = async () => {
            try {
                setLoadingCategories(true);
                const response = await fetch('/api/taxonomy');
                const data = await response.json();

                if (data.success) {
                    setCategories(data.data.categories);
                } else {
                    console.error('Error loading taxonomy:', data.error);
                }
            } catch (err) {
                console.error('Failed to fetch taxonomy:', err);
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchTaxonomy();
    }, []);

    const handlePreview = (doc: Document) => {
        setPreviewDocument({
            id: doc.id,
            name: doc.originalName,
            type: doc.fileType,
            size: doc.fileSize,
            content: doc.extractedText || 'Contenu non disponible',
            pageCount: doc.pageCount || undefined,
            wordCount: doc.wordCount || undefined,
        });
    };

    const handleBulkMove = async (categoryId: string, subCategoryId?: string) => {
        await moveSelectedToCategory(categoryId, subCategoryId);
        deselectAll();
    };

    // Compter les documents par catégorie
    const documentCounts = categories.reduce((acc, cat) => {
        acc[cat.id] = documentsByCategory[cat.id]?.length || 0;
        return acc;
    }, {} as Record<string, number>);

    // Afficher un loader si taxonomie en cours de chargement
    if (isLoading || loadingCategories) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-foreground-muted">
                        {loadingCategories ? 'Chargement des catégories...' : 'Chargement...'}
                    </p>
                </div>
            </div>
        );
    }

    if (error || !session) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <Card className="p-8 text-center">
                        <p className="text-error mb-4">{error || 'Session introuvable'}</p>
                        <Button onClick={() => router.push('/')}>Retour</Button>
                    </Card>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header showLanguageSwitch={false}>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowStats(!showStats)}
                        className="gap-2"
                    >
                        <BarChart3 className="h-4 w-4" />
                        Stats
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className="gap-2"
                    >
                        <Filter className="h-4 w-4" />
                        Filtres
                    </Button>
                </div>
            </Header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <aside className="w-80 border-r border-border bg-background overflow-y-auto p-4">
                    <CategoryTree
                        categories={categories}
                        documentCounts={documentCounts}
                        onSelectCategory={(catId) => setFilters({ ...filters, category: catId })}
                    />

                    {showFilters && (
                        <div className="mt-4">
                            <FilterPanel
                                filters={filters}
                                categories={presentCategories.filter((cat): cat is string => cat !== undefined)}
                                fileTypes={fileTypes}
                                onChange={setFilters}
                                onReset={() =>
                                    setFilters({
                                        category: '',
                                        fileType: '',
                                        minConfidence: 0,
                                        maxConfidence: 1,
                                    })
                                }
                            />
                        </div>
                    )}

                    {showStats && (
                        <Card className="mt-4 p-4">
                            <h3 className="font-semibold text-foreground mb-3">Statistiques</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-foreground-muted">Total:</span>
                                    <span className="font-medium">{stats.total}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-foreground-muted">Classifiés:</span>
                                    <span className="font-medium text-success">{stats.categorized}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-foreground-muted">Non classifiés:</span>
                                    <span className="font-medium text-warning">{stats.uncategorized}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-foreground-muted">Confiance moy:</span>
                                    <span className="font-medium">{stats.avgConfidence}%</span>
                                </div>
                            </div>
                        </Card>
                    )}
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-hidden flex flex-col">
                    {/* Search Bar */}
                    <div className="border-b border-border bg-background p-4">
                        <SearchBar value={searchQuery} onChange={setSearchQuery} />
                        {selectedDocuments.size > 0 && (
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-sm text-foreground-muted">
                                    {selectedDocuments.size} sélectionné{selectedDocuments.size > 1 ? 's' : ''}
                                </span>
                                <Button variant="ghost" size="sm" onClick={selectAll}>
                                    Tout sélectionner
                                </Button>
                                <Button variant="ghost" size="sm" onClick={deselectAll}>
                                    Tout désélectionner
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Kanban View */}
                    <div className="flex-1 overflow-x-auto overflow-y-hidden">
                        <DndContext
                            sensors={sensors}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onDragCancel={handleDragCancel}
                        >
                            <div className="flex gap-4 p-4 h-full">
                                {categories.map((category) => (
                                    <CategoryColumn
                                        key={category.id}
                                        category={category}
                                        documents={documentsByCategory[category.id] || []}
                                        selectedDocuments={selectedDocuments}
                                        onSelectDocument={toggleDocumentSelection}
                                        onPreviewDocument={handlePreview}
                                    />
                                ))}
                            </div>

                            <DragOverlay>
                                {activeDocument && (
                                    <div className="opacity-80">
                                        <DocumentCard document={activeDocument} isDragging />
                                    </div>
                                )}
                            </DragOverlay>
                        </DndContext>
                    </div>
                </main>
            </div>

            {/* Download Button (Fixed) */}
            <div className="fixed bottom-8 right-8 z-40">
                <DownloadButton
                    sessionId={sessionId}
                    documentCount={documents.length}
                />
            </div>

            {/* Bulk Actions */}
            <BulkActions
                selectedCount={selectedDocuments.size}
                categories={categories}
                onMove={handleBulkMove}
                onCancel={deselectAll}
            />

            {/* File Preview Modal */}
            <FilePreview
                file={previewDocument}
                open={!!previewDocument}
                onClose={() => setPreviewDocument(null)}
            />
        </div>
    );
}