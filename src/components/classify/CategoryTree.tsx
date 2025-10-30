'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Folder, FolderOpen } from 'lucide-react';
import { Category } from '@/types/category';
import { cn } from '@/lib/utils';

interface CategoryTreeProps {
    categories: Category[];
    selectedCategory?: string;
    onSelectCategory: (categoryId: string) => void;
    documentCounts?: Record<string, number>;
    className?: string;
}

export function CategoryTree({
    categories,
    selectedCategory,
    onSelectCategory,
    documentCounts = {},
    className,
}: CategoryTreeProps) {
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
        new Set(categories.map(c => c.id))
    );

    const toggleExpand = (categoryId: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(categoryId)) {
                next.delete(categoryId);
            } else {
                next.add(categoryId);
            }
            return next;
        });
    };

    const renderCategory = (category: Category, level: number = 0) => {
        const isExpanded = expandedCategories.has(category.id);
        const isSelected = selectedCategory === category.id;
        const hasChildren = category.children && category.children.length > 0;
        const count = documentCounts[category.id] || 0;

        return (
            <div key={category.id}>
                <div
                    className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors',
                        'hover:bg-background-secondary',
                        isSelected && 'bg-primary text-white hover:bg-primary-hover',
                        !isSelected && 'text-foreground'
                    )}
                    style={{ paddingLeft: `${level * 16 + 12}px` }}
                    onClick={() => onSelectCategory(category.id)}
                >
                    {/* Expand/Collapse button */}
                    {hasChildren && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(category.id);
                            }}
                            className="shrink-0"
                        >
                            {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )}
                        </button>
                    )}

                    {/* Folder icon */}
                    {!hasChildren && <div className="w-4" />}
                    {isExpanded ? (
                        <FolderOpen className="h-4 w-4 shrink-0" />
                    ) : (
                        <Folder className="h-4 w-4 shrink-0" />
                    )}

                    {/* Category color indicator */}
                    {category.color && (
                        <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: category.color }}
                        />
                    )}

                    {/* Category name */}
                    <span className="flex-1 text-sm font-medium truncate">
                        {category.name}
                    </span>

                    {/* Document count */}
                    {count > 0 && (
                        <span
                            className={cn(
                                'text-xs px-2 py-0.5 rounded-full shrink-0',
                                isSelected
                                    ? 'bg-white/20 text-white'
                                    : 'bg-background-tertiary text-foreground-muted'
                            )}
                        >
                            {count}
                        </span>
                    )}
                </div>

                {/* Render children */}
                {hasChildren && isExpanded && (
                    <div className="mt-1">
                        {category.children!.map(child => renderCategory(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={cn('space-y-1', className)}>
            <div className="px-3 py-2 mb-2">
                <h3 className="text-sm font-semibold text-foreground">Catégories</h3>
            </div>
            {categories.map(category => renderCategory(category))}
        </div>
    );
}