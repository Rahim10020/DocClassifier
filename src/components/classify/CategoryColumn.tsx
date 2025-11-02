'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { MoreVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DocumentCard } from './DocumentCard';
import { Document } from '@/types/document';
import { Category } from '@/types/category';
import { cn } from '@/lib/utils';

interface CategoryColumnProps {
    category: Category;
    documents: Document[];
    selectedDocuments: Set<string>;
    onSelectDocument: (documentId: string) => void;
    onPreviewDocument: (document: Document) => void;
    onCategoryAction?: (categoryId: string, action: string) => void;
    className?: string;
}

export function CategoryColumn({
    category,
    documents,
    selectedDocuments,
    onSelectDocument,
    onPreviewDocument,
    onCategoryAction,
    className,
}: CategoryColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: category.id,
        data: {
            category: category.id,
        },
    });

    const documentIds = documents.map(d => d.id);

    return (
        <div
            ref={setNodeRef}
            className={cn(
                'flex flex-col h-full min-w-[360px] max-w-[400px]',
                className
            )}
        >
            {/* Column Header - Shadow au lieu de border */}
            <Card
                className={cn(
                    'p-5 mb-4 shadow-md transition-all duration-300',
                    isOver && 'shadow-xl scale-[1.02] bg-primary-light ring-2 ring-primary'
                )}
            >
                <div
                    className="h-1 w-12 rounded-full mb-4 transition-all"
                    style={{
                        backgroundColor: category.color || 'var(--primary)',
                    }}
                />
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        {category.icon && (
                            <span className="text-2xl">{category.icon}</span>
                        )}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground truncate text-lg">
                                {category.name}
                            </h3>
                            <p className="text-sm text-foreground-muted font-medium">
                                {documents.length} document{documents.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    {onCategoryAction && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onCategoryAction(category.id, 'menu')}
                        >
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </Card>

            {/* Documents List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                <SortableContext items={documentIds} strategy={verticalListSortingStrategy}>
                    {documents.length === 0 ? (
                        <div
                            className={cn(
                                'flex flex-col items-center justify-center h-40 rounded-2xl transition-all duration-300',
                                isOver
                                    ? 'bg-primary-light shadow-lg scale-[1.02]'
                                    : 'bg-background-elevated shadow-sm'
                            )}
                        >
                            <div className="text-4xl mb-3 opacity-50">
                                {category.icon || '📁'}
                            </div>
                            <p className="text-sm text-foreground-muted text-center px-4 font-medium">
                                {isOver
                                    ? 'Déposez le document ici'
                                    : 'Aucun document'}
                            </p>
                        </div>
                    ) : (
                        documents.map(doc => (
                            <DocumentCard
                                key={doc.id}
                                document={doc}
                                isSelected={selectedDocuments.has(doc.id)}
                                onSelect={() => onSelectDocument(doc.id)}
                                onPreview={() => onPreviewDocument(doc)}
                            />
                        ))
                    )}
                </SortableContext>
            </div>
        </div>
    );
}