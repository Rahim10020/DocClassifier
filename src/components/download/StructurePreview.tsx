'use client';

import React, { useState, useEffect } from 'react';
import { Folder, File, Loader2, ChevronRight, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StructurePreviewProps {
    sessionId: string;
    structure: 'flat' | 'hierarchical';
}

interface PreviewData {
    structure: string;
    totalFiles: number;
    totalSize: number;
    preview: any;
}

export function StructurePreview({ sessionId, structure }: StructurePreviewProps) {
    const [data, setData] = useState<PreviewData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchPreview = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `/api/download?sessionId=${sessionId}&structure=${structure}`
                );
                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.error || 'Erreur lors de la récupération de l\'aperçu');
                }

                setData(result.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erreur inconnue');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPreview();
    }, [sessionId, structure]);

    const toggleFolder = (folderId: string) => {
        setExpandedFolders((prev) => {
            const next = new Set(prev);
            if (next.has(folderId)) {
                next.delete(folderId);
            } else {
                next.add(folderId);
            }
            return next;
        });
    };

    const renderHierarchicalPreview = (preview: any) => {
        return Object.entries(preview).map(([category, data]: [string, any]) => {
            const isExpanded = expandedFolders.has(category);
            const hasSubcategories = Object.keys(data.subcategories || {}).length > 0;
            const totalFiles = data.files.length +
                Object.values(data.subcategories || {}).reduce(
                    (sum: number, sub: any) => sum + sub.files.length,
                    0
                );

            return (
                <div key={category} className="ml-2">
                    <button
                        onClick={() => toggleFolder(category)}
                        className="flex items-center gap-2 py-1 hover:bg-background-secondary rounded px-2 w-full text-left"
                    >
                        {hasSubcategories || data.files.length > 0 ? (
                            isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-foreground-muted" />
                            ) : (
                                <ChevronRight className="h-4 w-4 text-foreground-muted" />
                            )
                        ) : (
                            <div className="w-4" />
                        )}
                        <Folder className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">
                            {category}
                        </span>
                        <span className="text-xs text-foreground-muted">
                            ({totalFiles})
                        </span>
                    </button>

                    {isExpanded && (
                        <div className="ml-6 mt-1 space-y-1">
                            {/* Files in main category */}
                            {data.files.map((file: string, index: number) => (
                                <div key={index} className="flex items-center gap-2 py-1 px-2">
                                    <File className="h-3 w-3 text-foreground-muted" />
                                    <span className="text-xs text-foreground">{file}</span>
                                </div>
                            ))}

                            {/* Subcategories */}
                            {Object.entries(data.subcategories || {}).map(([subName, subData]: [string, any]) => {
                                const subId = `${category}-${subName}`;
                                const isSubExpanded = expandedFolders.has(subId);

                                return (
                                    <div key={subName}>
                                        <button
                                            onClick={() => toggleFolder(subId)}
                                            className="flex items-center gap-2 py-1 hover:bg-background-secondary rounded px-2 w-full text-left"
                                        >
                                            {isSubExpanded ? (
                                                <ChevronDown className="h-3 w-3 text-foreground-muted" />
                                            ) : (
                                                <ChevronRight className="h-3 w-3 text-foreground-muted" />
                                            )}
                                            <Folder className="h-3 w-3 text-success" />
                                            <span className="text-xs font-medium text-foreground">
                                                {subName}
                                            </span>
                                            <span className="text-xs text-foreground-muted">
                                                ({subData.files.length})
                                            </span>
                                        </button>

                                        {isSubExpanded && (
                                            <div className="ml-6 mt-1 space-y-1">
                                                {subData.files.map((file: string, index: number) => (
                                                    <div key={index} className="flex items-center gap-2 py-1 px-2">
                                                        <File className="h-3 w-3 text-foreground-muted" />
                                                        <span className="text-xs text-foreground">{file}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            );
        });
    };

    const renderFlatPreview = (preview: string[]) => {
        return preview.map((file, index) => (
            <div key={index} className="flex items-center gap-2 py-1 px-2">
                <File className="h-4 w-4 text-foreground-muted" />
                <span className="text-sm text-foreground">{file}</span>
            </div>
        ));
    };

    if (isLoading) {
        return (
            <Card className="p-6">
                <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-sm text-foreground-muted">
                        Génération de l'aperçu...
                    </span>
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="p-6">
                <p className="text-sm text-error">{error}</p>
            </Card>
        );
    }

    if (!data) return null;

    return (
        <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-foreground">Aperçu de la structure</h4>
                <div className="text-xs text-foreground-muted">
                    {data.totalFiles} fichiers
                </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto rounded-lg border border-border bg-background-secondary p-3">
                {structure === 'hierarchical'
                    ? renderHierarchicalPreview(data.preview)
                    : renderFlatPreview(data.preview)}
            </div>
        </Card>
    );
}