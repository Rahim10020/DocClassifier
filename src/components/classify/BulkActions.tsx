'use client';

import React, { useState } from 'react';
import { Move, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Category } from '@/types/category';
import { cn } from '@/lib/utils';

interface BulkActionsProps {
    selectedCount: number;
    categories: Category[];
    onMove: (categoryId: string, subCategoryId?: string) => void;
    onCancel: () => void;
    className?: string;
}

export function BulkActions({
    selectedCount,
    categories,
    onMove,
    onCancel,
    className,
}: BulkActionsProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');

    const category = categories.find(c => c.id === selectedCategory);
    const subCategories = category?.children || [];

    const handleMove = () => {
        if (selectedCategory) {
            onMove(selectedCategory, selectedSubCategory || undefined);
            setSelectedCategory('');
            setSelectedSubCategory('');
        }
    };

    if (selectedCount === 0) return null;

    return (
        <Card
            className={cn(
                'fixed bottom-4 left-1/2 -translate-x-1/2 z-50 shadow-lg animate-in slide-in-from-bottom',
                className
            )}
        >
            <div className="flex items-center gap-4 p-4">
                <div className="flex items-center gap-2">
                    <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                        {selectedCount}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                        document{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
                    </span>
                </div>

                <div className="h-6 w-px bg-border" />

                {/* Category selector */}
                <select
                    value={selectedCategory}
                    onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setSelectedSubCategory('');
                    }}
                    className="px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>

                {/* Subcategory selector */}
                {subCategories.length > 0 && (
                    <select
                        value={selectedSubCategory}
                        onChange={(e) => setSelectedSubCategory(e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">Sous-catégorie (optionnel)</option>
                        {subCategories.map((sub) => (
                            <option key={sub.id} value={sub.id}>
                                {sub.name}
                            </option>
                        ))}
                    </select>
                )}

                {/* Move button */}
                <Button
                    onClick={handleMove}
                    disabled={!selectedCategory}
                    size="sm"
                    className="gap-2"
                >
                    <Move className="h-4 w-4" />
                    Déplacer
                </Button>

                <div className="h-6 w-px bg-border" />

                {/* Cancel button */}
                <Button onClick={onCancel} variant="ghost" size="sm">
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </Card>
    );
}