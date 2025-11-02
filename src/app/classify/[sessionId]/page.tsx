'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { Header } from '@/components/shared/Header';
import { SearchBar } from '@/components/classify/SearchBar';
import { CategoryTree } from '@/components/classify/CategoryTree';
import { CategoryColumn } from '@/components/classify/CategoryColumn';
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
import { Filter, BarChart3, Loader2 } from 'lucide-react';

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

    // Charger la taxonomie via API
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

    const documentCounts = categories.reduce((acc, cat) => {
        acc[cat.id] = documentsByCategory[cat.id]?.length || 0;
        return acc;
    }, {} as Record<string, number>);

    if (isLoading || loadingCategories) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-foreground-muted font-medium">
                        {loadingCategories ? 'Chargement des catégories...' : 'Chargement...'}
                    </p>
                </div>
            </div>
        );
    }

    if (error || !session) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header />
                <main className="flex-1 flex items-center justify-center px-6">
                    <Card className="p-8 text-center max-w-md shadow-lg">
                        <p className="text-error mb-4 font-medium">{error || 'Session introuvable'}</p>
                        <Button onClick={() => router.push('/')}>Retour à l'accueil</Button>
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
                {/* Sidebar - Background au lieu de border */}
                <aside className="w-80 bg-background-secondary overflow-y-auto p-6 shadow-sm">
                    <CategoryTree
                        categories={categories}
                        documentCounts={documentCounts}
                        onSelectCategory={(catId) => setFilters({ ...filters, category: catId })}
                    />

                    {showFilters && (
                        <div className="mt-6 animate-slide-in">
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
                        <Card className="mt-6 p-6 shadow-md animate-slide-in">
                            <h3 className="font-semibold text-foreground mb-4 text-lg">Statistiques</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-foreground-muted">Total:</span>
                                    <span className="font-semibold text-lg">{stats.total}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-foreground-muted">Classifiés:</span>
                                    <span className="font-semibold text-success text-lg">{stats.categorized}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-foreground-muted">Non classifiés:</span>
                                    <span className="font-semibold text-warning text-lg">{stats.uncategorized}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 pt-3 border-t border-border">
                                    <span className="text-foreground-muted">Confiance moyenne:</span>
                                    <span className="font-semibold text-primary text-lg">{stats.avgConfidence}%</span>
                                </div>
                            </div>
                        </Card>
                    )}
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-hidden flex flex-col">
                    {/* Search Bar - Padding au lieu de border */}
                    <div className="bg-background-elevated shadow-sm p-6">
                        <SearchBar value={searchQuery} onChange={setSearchQuery} />
                        {selectedDocuments.size > 0 && (
                            <div className="mt-3 flex items-center gap-3 animate-fade-in">
                                <span className="text-sm text-foreground-muted font-medium">
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
                    <div className="flex-1 overflow-x-auto overflow-y-hidden bg-background-secondary">
                        <DndContext
                            sensors={sensors}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onDragCancel={handleDragCancel}
                        >
                            <div className="flex gap-6 p-6 h-full">
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
                                    <Card className="opacity-90 shadow-2xl p-4 max-w-xs scale-105">
                                        <div className="flex items-center gap-3">
                                            <div className="text-2xl">
                                                {activeDocument.fileType === 'pdf' ? '📄' :
                                                    activeDocument.fileType === 'xlsx' ? '📊' : '📎'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-foreground truncate">
                                                    {activeDocument.originalName}
                                                </p>
                                                <p className="text-xs text-foreground-muted">
                                                    {activeDocument.fileType.toUpperCase()}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
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