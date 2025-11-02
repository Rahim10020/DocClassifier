'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Search, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Document } from '@/types/document';
import { Category } from '@/types/category';
import { formatFileSize, getFileIcon } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface FinderViewProps {
    documents: Document[];
    categories: Category[];
    onUpdateDocument: (documentId: string, updates: Partial<Document>) => Promise<void>;
    className?: string;
}

interface GroupedDocuments {
    [category: string]: Document[];
}

export function FinderView({
    documents,
    categories,
    onUpdateDocument,
    className,
}: FinderViewProps) {
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [draggedDoc, setDraggedDoc] = useState<string | null>(null);

    // Grouper les documents par catégorie
    const groupedDocs: GroupedDocuments = documents.reduce((acc, doc) => {
        const category = doc.mainCategory || 'Non classifié';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(doc);
        return acc;
    }, {} as GroupedDocuments);

    // Filtrer par recherche
    const filteredGroups = Object.entries(groupedDocs).reduce((acc, [category, docs]) => {
        const filtered = docs.filter(doc =>
            doc.originalName.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (filtered.length > 0) {
            acc[category] = filtered;
        }
        return acc;
    }, {} as GroupedDocuments);

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(category)) {
                next.delete(category);
            } else {
                next.add(category);
            }
            return next;
        });
    };

    const handleDragStart = (docId: string) => {
        setDraggedDoc(docId);
    };

    const handleDragEnd = () => {
        setDraggedDoc(null);
    };

    const handleDrop = async (targetCategory: string) => {
        if (!draggedDoc) return;

        const doc = documents.find(d => d.id === draggedDoc);
        if (!doc || doc.mainCategory === targetCategory) return;

        await onUpdateDocument(draggedDoc, { mainCategory: targetCategory });
        setDraggedDoc(null);
    };

    const getSubcategories = (categoryId: string): Category[] => {
        const category = categories.find(c => c.id === categoryId || c.name === categoryId);
        return category?.children || [];
    };

    return (
        <div className={cn('flex flex-col h-full', className)}>
            {/* Barre de recherche */}
            <div className="p-6 bg-background-elevated shadow-sm">
                <div className="relative max-w-2xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher un document..."
                        className="w-full pl-12 pr-12 py-3 rounded-xl bg-background-secondary border-0 focus:ring-2 focus:ring-primary"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-background-tertiary rounded-lg"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Liste des documents groupés */}
            <div className="flex-1 overflow-y-auto p-6 bg-background">
                <div className="max-w-5xl mx-auto space-y-4">
                    {Object.entries(filteredGroups).map(([category, docs]) => {
                        const isExpanded = expandedCategories.has(category);
                        const categoryObj = categories.find(c => c.name === category || c.id === category);

                        return (
                            <Card
                                key={category}
                                className="overflow-hidden"
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.classList.add('ring-2', 'ring-primary');
                                }}
                                onDragLeave={(e) => {
                                    e.currentTarget.classList.remove('ring-2', 'ring-primary');
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.classList.remove('ring-2', 'ring-primary');
                                    handleDrop(category);
                                }}
                            >
                                {/* En-tête de catégorie */}
                                <button
                                    onClick={() => toggleCategory(category)}
                                    className="w-full flex items-center gap-3 p-4 hover:bg-background-secondary transition-colors"
                                >
                                    {isExpanded ? (
                                        <ChevronDown className="h-5 w-5 text-foreground-muted" />
                                    ) : (
                                        <ChevronRight className="h-5 w-5 text-foreground-muted" />
                                    )}
                                    <div
                                        className="w-1 h-8 rounded-full"
                                        style={{ backgroundColor: categoryObj?.color || 'var(--primary)' }}
                                    />
                                    <div className="flex-1 text-left">
                                        <h3 className="font-semibold text-foreground text-lg">
                                            {category}
                                        </h3>
                                        <p className="text-sm text-foreground-muted">
                                            {docs.length} document{docs.length > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </button>

                                {/* Liste des documents */}
                                {isExpanded && (
                                    <div className="border-t border-border">
                                        {docs.map((doc, index) => (
                                            <DocumentRow
                                                key={doc.id}
                                                document={doc}
                                                categories={categories}
                                                subcategories={getSubcategories(category)}
                                                onUpdate={onUpdateDocument}
                                                onDragStart={() => handleDragStart(doc.id)}
                                                onDragEnd={handleDragEnd}
                                                isDragging={draggedDoc === doc.id}
                                                isLast={index === docs.length - 1}
                                            />
                                        ))}
                                    </div>
                                )}
                            </Card>
                        );
                    })}

                    {Object.keys(filteredGroups).length === 0 && (
                        <Card className="p-12 text-center">
                            <p className="text-foreground-muted">
                                {searchQuery
                                    ? 'Aucun document trouvé'
                                    : 'Aucun document classifié'}
                            </p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

interface DocumentRowProps {
    document: Document;
    categories: Category[];
    subcategories: Category[];
    onUpdate: (documentId: string, updates: Partial<Document>) => Promise<void>;
    onDragStart: () => void;
    onDragEnd: () => void;
    isDragging: boolean;
    isLast: boolean;
}

function DocumentRow({
    document,
    categories,
    subcategories,
    onUpdate,
    onDragStart,
    onDragEnd,
    isDragging,
    isLast,
}: DocumentRowProps) {
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            className={cn(
                'flex items-center gap-4 p-4 hover:bg-background-secondary transition-colors',
                !isLast && 'border-b border-border',
                isDragging && 'opacity-50'
            )}
        >
            {/* Icône du fichier */}
            <div className="text-3xl shrink-0">
                {getFileIcon(document.fileType)}
            </div>

            {/* Informations du document */}
            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate mb-1">
                    {document.originalName}
                </h4>
                <div className="flex items-center gap-2 text-sm text-foreground-muted">
                    <span>{formatFileSize(document.fileSize)}</span>
                    <span>•</span>
                    <span>{document.fileType.toUpperCase()}</span>
                    {document.confidence && (
                        <>
                            <span>•</span>
                            <span>{Math.round(document.confidence * 100)}% confiance</span>
                        </>
                    )}
                </div>
            </div>

            {/* Dropdowns de modification */}
            {isEditing ? (
                <div className="flex items-center gap-2">
                    {/* Dropdown Catégorie */}
                    <select
                        value={document.mainCategory || ''}
                        onChange={(e) => {
                            onUpdate(document.id, {
                                mainCategory: e.target.value,
                                subCategory: undefined,
                            });
                        }}
                        className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
                    >
                        <option value="">Non classifié</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.name}>
                                {cat.name}
                            </option>
                        ))}
                    </select>

                    {/* Dropdown Sous-catégorie */}
                    {subcategories.length > 0 && (
                        <select
                            value={document.subCategory || ''}
                            onChange={(e) => {
                                onUpdate(document.id, { subCategory: e.target.value || undefined });
                            }}
                            className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
                        >
                            <option value="">Aucune</option>
                            {subcategories.map((sub) => (
                                <option key={sub.id} value={sub.name}>
                                    {sub.name}
                                </option>
                            ))}
                        </select>
                    )}

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(false)}
                    >
                        OK
                    </Button>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <div className="text-sm">
                        <span className="text-foreground font-medium">{document.mainCategory}</span>
                        {document.subCategory && (
                            <span className="text-foreground-muted"> › {document.subCategory}</span>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                    >
                        Modifier
                    </Button>
                </div>
            )}
        </div>
    );
}