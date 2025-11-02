'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Eye, GripVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { Document } from '@/types/document';
import { formatFileSize, calculateConfidenceLabel, calculateConfidenceColor } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface DocumentCardProps {
    document: Document;
    isSelected?: boolean;
    onSelect?: () => void;
    onPreview?: () => void;
    isDragging?: boolean;
}

export function DocumentCard({
    document,
    isSelected = false,
    onSelect,
    onPreview,
}: DocumentCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging,
    } = useSortable({ id: document.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isSortableDragging ? 0.5 : 1,
    };

    const confidenceLabel = document.confidence
        ? calculateConfidenceLabel(document.confidence)
        : 'N/A';

    const confidenceColor = document.confidence
        ? calculateConfidenceColor(document.confidence)
        : 'var(--foreground-muted)';

    const getFileIcon = () => {
        const type = document.fileType.toLowerCase();
        if (['pdf', 'docx', 'doc', 'txt', 'md', 'rtf', 'odt'].includes(type)) {
            return '📄';
        }
        if (['xlsx', 'xls', 'csv', 'ods'].includes(type)) {
            return '📊';
        }
        return '📎';
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={cn(
                'p-4 transition-all duration-200 group cursor-pointer',
                'shadow-sm hover:shadow-lg hover:-translate-y-1',
                isSelected && 'ring-2 ring-primary bg-primary-light shadow-md',
                isSortableDragging && 'cursor-grabbing shadow-2xl scale-105 rotate-2'
            )}
        >
            <div className="flex items-start gap-3">
                {/* Drag handle */}
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-foreground-muted hover:text-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <GripVertical className="h-5 w-5" />
                </button>

                {/* Checkbox */}
                {onSelect && (
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={onSelect}
                        className="mt-2 cursor-pointer w-4 h-4 rounded border-2 border-border text-primary focus:ring-2 focus:ring-primary transition-all"
                    />
                )}

                {/* File icon */}
                <div className="text-3xl shrink-0 mt-0.5">{getFileIcon()}</div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <Tooltip content={document.originalName}>
                        <h4 className="font-medium text-foreground truncate text-sm leading-snug">
                            {document.originalName}
                        </h4>
                    </Tooltip>

                    <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                        <Badge variant="outline" className="text-xs font-medium shadow-xs">
                            {document.fileType.toUpperCase()}
                        </Badge>

                        <span className="text-xs text-foreground-muted font-medium">
                            {formatFileSize(document.fileSize)}
                        </span>

                        {document.confidence !== null && document.confidence !== undefined && (
                            <Badge
                                variant="outline"
                                style={{
                                    borderColor: confidenceColor,
                                    color: confidenceColor,
                                    backgroundColor: `${confidenceColor}10`
                                }}
                                className="text-xs font-semibold shadow-xs"
                            >
                                {confidenceLabel} {Math.round(document.confidence * 100)}%
                            </Badge>
                        )}

                        {document.pageCount && (
                            <span className="text-xs text-foreground-muted">
                                {document.pageCount} pages
                            </span>
                        )}
                    </div>

                    {/* Keywords preview */}
                    {document.keywords && document.keywords.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                            {document.keywords.slice(0, 3).map((keyword, index) => (
                                <span
                                    key={index}
                                    className="text-xs px-2 py-1 rounded-lg bg-background-secondary text-foreground-muted font-medium shadow-xs"
                                >
                                    {keyword}
                                </span>
                            ))}
                            {document.keywords.length > 3 && (
                                <span className="text-xs text-foreground-muted font-medium px-2 py-1">
                                    +{document.keywords.length - 3}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Preview button */}
                {onPreview && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onPreview}
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </Card>
    );
}