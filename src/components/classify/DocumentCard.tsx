'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FileText, Eye, GripVertical } from 'lucide-react';
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
    isDragging = false,
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
                'p-4 transition-all hover:shadow-md',
                isSelected && 'ring-2 ring-primary bg-primary-light',
                isSortableDragging && 'cursor-grabbing shadow-lg scale-105'
            )}
        >
            <div className="flex items-start gap-3">
                {/* Drag handle */}
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-foreground-muted hover:text-foreground mt-1"
                >
                    <GripVertical className="h-5 w-5" />
                </button>

                {/* Checkbox */}
                {onSelect && (
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={onSelect}
                        className="mt-1.5 cursor-pointer"
                    />
                )}

                {/* File icon */}
                <div className="text-2xl shrink-0">{getFileIcon()}</div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <Tooltip content={document.originalName}>
                        <h4 className="font-medium text-foreground truncate">
                            {document.originalName}
                        </h4>
                    </Tooltip>

                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                            {document.fileType.toUpperCase()}
                        </Badge>

                        <span className="text-xs text-foreground-muted">
                            {formatFileSize(document.fileSize)}
                        </span>

                        {document.confidence !== null && document.confidence !== undefined && (
                            <Badge
                                variant="outline"
                                style={{ borderColor: confidenceColor, color: confidenceColor }}
                                className="text-xs"
                            >
                                {confidenceLabel} ({Math.round(document.confidence * 100)}%)
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
                        <div className="mt-2 flex flex-wrap gap-1">
                            {document.keywords.slice(0, 3).map((keyword, index) => (
                                <span
                                    key={index}
                                    className="text-xs px-2 py-0.5 rounded-full bg-background-tertiary text-foreground-muted"
                                >
                                    {keyword}
                                </span>
                            ))}
                            {document.keywords.length > 3 && (
                                <span className="text-xs text-foreground-muted">
                                    +{document.keywords.length - 3}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Preview button */}
                {onPreview && (
                    <Button variant="ghost" size="icon" onClick={onPreview} className="shrink-0">
                        <Eye className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </Card>
    );
}