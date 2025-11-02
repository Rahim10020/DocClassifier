'use client';

import React from 'react';
import { Filter, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FilterPanelProps {
    filters: {
        category: string;
        fileType: string;
        minConfidence: number;
        maxConfidence: number;
    };
    categories: string[];
    fileTypes: string[];
    onChange: (filters: FilterPanelProps['filters']) => void;
    onReset: () => void;
    className?: string;
}

export function FilterPanel({
    filters,
    categories,
    fileTypes,
    onChange,
    onReset,
    className,
}: FilterPanelProps) {
    const hasActiveFilters =
        filters.category ||
        filters.fileType ||
        filters.minConfidence > 0 ||
        filters.maxConfidence < 1;

    return (
        <Card className={cn('p-4', className)}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-foreground-muted" />
                    <h3 className="font-semibold text-foreground">Filtres</h3>
                </div>
                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={onReset}>
                        <X className="h-4 w-4 mr-1" />
                        Réinitialiser
                    </Button>
                )}
            </div>

            <div className="space-y-4">
                {/* Category Filter */}
                <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                        Catégorie
                    </label>
                    <select
                        value={filters.category}
                        onChange={(e) =>
                            onChange({ ...filters, category: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">Toutes les catégories</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>

                {/* File Type Filter */}
                <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                        Type de fichier
                    </label>
                    <select
                        value={filters.fileType}
                        onChange={(e) =>
                            onChange({ ...filters, fileType: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">Tous les types</option>
                        {fileTypes.map((type) => (
                            <option key={type} value={type}>
                                {type.toUpperCase()}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Confidence Filter */}
                <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                        Confiance de classification
                    </label>
                    <div className="space-y-2">
                        <div>
                            <label className="text-xs text-foreground-muted">
                                Minimum: {Math.round(filters.minConfidence * 100)}%
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={filters.minConfidence * 100}
                                onChange={(e) =>
                                    onChange({
                                        ...filters,
                                        minConfidence: parseInt(e.target.value) / 100,
                                    })
                                }
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-foreground-muted">
                                Maximum: {Math.round(filters.maxConfidence * 100)}%
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={filters.maxConfidence * 100}
                                onChange={(e) =>
                                    onChange({
                                        ...filters,
                                        maxConfidence: parseInt(e.target.value) / 100,
                                    })
                                }
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Active Filters Summary */}
                {hasActiveFilters && (
                    <div className="pt-4 border-t border-border">
                        <p className="text-xs text-foreground-muted mb-2">
                            Filtres actifs:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {filters.category && (
                                <Badge variant="secondary">
                                    Catégorie: {filters.category}
                                </Badge>
                            )}
                            {filters.fileType && (
                                <Badge variant="secondary">
                                    Type: {filters.fileType.toUpperCase()}
                                </Badge>
                            )}
                            {(filters.minConfidence > 0 || filters.maxConfidence < 1) && (
                                <Badge variant="secondary">
                                    Confiance: {Math.round(filters.minConfidence * 100)}% -{' '}
                                    {Math.round(filters.maxConfidence * 100)}%
                                </Badge>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}