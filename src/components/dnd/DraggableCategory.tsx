'use client';

import * as React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { TooltipWrapper } from '@/components/ui/tooltip';

/**
 * Draggable category component for hierarchical category management
 */

export interface Category {
    id: string;
    name: string;
    path: string;
    children?: Category[];
    documentCount?: number;
    isExpanded?: boolean;
    color?: string;
}

interface DraggableCategoryProps {
    category: Category;
    level?: number;
    isSelected?: boolean;
    isDropTarget?: boolean;
    onToggle?: (categoryId: string) => void;
    onSelect?: (categoryId: string) => void;
    onContextMenu?: (category: Category, event: React.MouseEvent) => void;
    className?: string;
    showDocumentCount?: boolean;
    dragDisabled?: boolean;
}

export function DraggableCategory({
    category,
    level = 0,
    isSelected = false,
    isDropTarget = false,
    onToggle,
    onSelect,
    onContextMenu,
    className,
    showDocumentCount = true,
    dragDisabled = false,
}: DraggableCategoryProps) {
    const [isExpanded, setIsExpanded] = React.useState(category.isExpanded ?? false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: category.id,
        disabled: dragDisabled,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleToggle = React.useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(prev => !prev);
        onToggle?.(category.id);
    }, [category.id, onToggle]);

    const handleSelect = React.useCallback(() => {
        onSelect?.(category.id);
    }, [category.id, onSelect]);

    const handleContextMenu = React.useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        onContextMenu?.(category, e);
    }, [category, onContextMenu]);

    const hasChildren = category.children && category.children.length > 0;
    const displayName = category.name || 'Untitled Category';
    const indent = level * 20; // 20px per level

    return (
        <div className={cn('select-none', className)}>
            <div
                ref={setNodeRef}
                style={style}
                className={cn(
                    'group flex items-center gap-1 py-1 px-2 rounded-md cursor-pointer transition-colors',
                    'hover:bg-gray-100',
                    isSelected && 'bg-blue-50 border border-blue-200',
                    isDropTarget && 'bg-green-50 border border-green-200',
                    isDragging && 'opacity-50 shadow-lg',
                    level > 0 && 'ml-4'
                )}
                onClick={handleSelect}
                onContextMenu={handleContextMenu}
            >
                {/* Drag handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className={cn(
                        'flex items-center justify-center w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing',
                        dragDisabled && 'opacity-0'
                    )}
                >
                    <div className="w-3 h-3 flex flex-col justify-center">
                        <div className="w-0.5 h-0.5 bg-current rounded-full mb-0.5" />
                        <div className="w-0.5 h-0.5 bg-current rounded-full mb-0.5" />
                        <div className="w-0.5 h-0.5 bg-current rounded-full" />
                    </div>
                </div>

                {/* Expand/collapse button */}
                {hasChildren && (
                    <button
                        onClick={handleToggle}
                        className="flex items-center justify-center w-4 h-4 text-gray-500 hover:text-gray-700"
                    >
                        {isExpanded ? (
                            <ChevronDown className="w-3 h-3" />
                        ) : (
                            <ChevronRight className="w-3 h-3" />
                        )}
                    </button>
                )}

                {/* Category icon */}
                <div className="flex items-center justify-center w-4 h-4">
                    {isExpanded && hasChildren ? (
                        <FolderOpen className="w-4 h-4 text-blue-600" />
                    ) : (
                        <Folder className="w-4 h-4 text-blue-600" />
                    )}
                </div>

                {/* Category name */}
                <div className="flex-1 min-w-0">
                    <TooltipWrapper content={displayName}>
                        <span className="text-sm text-gray-900 truncate">
                            {displayName}
                        </span>
                    </TooltipWrapper>
                </div>

                {/* Document count */}
                {showDocumentCount && category.documentCount !== undefined && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <span>({category.documentCount})</span>
                    </div>
                )}

                {/* Color indicator */}
                {category.color && (
                    <div
                        className="w-3 h-3 rounded-full border border-gray-300"
                        style={{ backgroundColor: category.color }}
                    />
                )}
            </div>

            {/* Children categories */}
            {hasChildren && isExpanded && (
                <div className="ml-2">
                    {category.children!.map((child) => (
                        <DraggableCategory
                            key={child.id}
                            category={child}
                            level={level + 1}
                            isSelected={isSelected}
                            onToggle={onToggle}
                            onSelect={onSelect}
                            onContextMenu={onContextMenu}
                            showDocumentCount={showDocumentCount}
                            dragDisabled={dragDisabled}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * Category tree component for displaying hierarchical categories
 */
interface CategoryTreeProps {
    categories: Category[];
    selectedCategoryId?: string;
    expandedCategoryIds?: Set<string>;
    onCategoryToggle?: (categoryId: string) => void;
    onCategorySelect?: (categoryId: string) => void;
    onCategoryContextMenu?: (category: Category, event: React.MouseEvent) => void;
    className?: string;
    showDocumentCount?: boolean;
    dragDisabled?: boolean;
}

export function CategoryTree({
    categories,
    selectedCategoryId,
    expandedCategoryIds = new Set(),
    onCategoryToggle,
    onCategorySelect,
    onCategoryContextMenu,
    className,
    showDocumentCount = true,
    dragDisabled = false,
}: CategoryTreeProps) {
    const handleCategoryToggle = React.useCallback((categoryId: string) => {
        onCategoryToggle?.(categoryId);
    }, [onCategoryToggle]);

    const handleCategorySelect = React.useCallback((categoryId: string) => {
        onCategorySelect?.(categoryId);
    }, [onCategorySelect]);

    const handleCategoryContextMenu = React.useCallback((category: Category, event: React.MouseEvent) => {
        onCategoryContextMenu?.(category, event);
    }, [onCategoryContextMenu]);

    return (
        <div className={cn('space-y-1', className)}>
            {categories.map((category) => (
                <DraggableCategory
                    key={category.id}
                    category={{
                        ...category,
                        isExpanded: expandedCategoryIds.has(category.id),
                    }}
                    isSelected={selectedCategoryId === category.id}
                    onToggle={handleCategoryToggle}
                    onSelect={handleCategorySelect}
                    onContextMenu={handleCategoryContextMenu}
                    showDocumentCount={showDocumentCount}
                    dragDisabled={dragDisabled}
                />
            ))}
        </div>
    );
}

/**
 * Simple category item for non-hierarchical displays
 */
interface SimpleCategoryProps {
    category: Category;
    isSelected?: boolean;
    onClick?: () => void;
    onContextMenu?: (event: React.MouseEvent) => void;
    className?: string;
    showDocumentCount?: boolean;
}

export function SimpleCategory({
    category,
    isSelected = false,
    onClick,
    onContextMenu,
    className,
    showDocumentCount = true,
}: SimpleCategoryProps) {
    const handleContextMenu = React.useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        onContextMenu?.(e);
    }, [onContextMenu]);

    return (
        <div
            className={cn(
                'flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors',
                'hover:bg-gray-100',
                isSelected && 'bg-blue-50 border border-blue-200',
                className
            )}
            onClick={onClick}
            onContextMenu={handleContextMenu}
        >
            <Folder className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="flex-1 text-sm text-gray-900 truncate">
                {category.name}
            </span>
            {showDocumentCount && category.documentCount !== undefined && (
                <span className="text-xs text-gray-500">
                    ({category.documentCount})
                </span>
            )}
        </div>
    );
}