'use client';

import * as React from 'react';
import { DragOverlay as DndKitDragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils/cn';

/**
 * Drag overlay component for @dnd-kit
 * Shows a preview of the dragged item during drag operations
 */

interface DragOverlayProps {
    children: React.ReactNode;
    className?: string;
}

export function DragOverlay({ children, className }: DragOverlayProps) {
    return (
        <DndKitDragOverlay>
            <div
                className={cn(
                    'bg-white border border-gray-200 rounded-lg shadow-lg p-3 opacity-90 rotate-3 scale-105',
                    className
                )}
            >
                {children}
            </div>
        </DndKitDragOverlay>
    );
}

/**
 * Draggable item wrapper component
 */
interface DraggableItemProps {
    id: string;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
    data?: Record<string, any>;
}

export function DraggableItem({
    id,
    children,
    className,
    disabled = false,
    data,
}: DraggableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging,
    } = useDraggable({
        id,
        disabled,
        data,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'cursor-grab active:cursor-grabbing transition-transform',
                isDragging && 'opacity-50',
                disabled && 'cursor-not-allowed opacity-50',
                className
            )}
            {...listeners}
            {...attributes}
        >
            {children}
        </div>
    );
}

/**
 * Droppable area wrapper component
 */
interface DroppableAreaProps {
    id: string;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
    data?: Record<string, any>;
    accept?: string[];
}

export function DroppableArea({
    id,
    children,
    className,
    disabled = false,
    data,
    accept,
}: DroppableAreaProps) {
    const {
        isOver,
        setNodeRef,
        active,
    } = useDroppable({
        id,
        disabled,
        data,
    });

    const isActive = active && (!accept || accept.includes(active.id as string));

    return (
        <div
            ref={setNodeRef}
            className={cn(
                'transition-colors duration-200',
                isOver && isActive && 'bg-blue-50 border-blue-300',
                isActive && 'bg-green-50 border-green-300',
                disabled && 'opacity-50 pointer-events-none',
                className
            )}
        >
            {children}
        </div>
    );
}

/**
 * Drag handle component for better UX
 */
interface DragHandleProps {
    className?: string;
    disabled?: boolean;
}

export function DragHandle({ className, disabled = false }: DragHandleProps) {
    return (
        <div
            className={cn(
                'flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing',
                disabled && 'cursor-not-allowed opacity-50',
                className
            )}
        >
            <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="w-4 h-4"
            >
                <path
                    d="M4 6a1 1 0 100-2 1 1 0 000 2zM4 10a1 1 0 100-2 1 1 0 000 2zM4 14a1 1 0 100-2 1 1 0 000 2zM8 6a1 1 0 100-2 1 1 0 000 2zM8 10a1 1 0 100-2 1 1 0 000 2zM8 14a1 1 0 100-2 1 1 0 000 2zM12 6a1 1 0 100-2 1 1 0 000 2zM12 10a1 1 0 100-2 1 1 0 000 2zM12 14a1 1 0 100-2 1 1 0 000 2z"
                    fill="currentColor"
                />
            </svg>
        </div>
    );
}

/**
 * Drop zone indicator component
 */
interface DropZoneProps {
    isActive: boolean;
    isOver: boolean;
    className?: string;
    children?: React.ReactNode;
}

export function DropZone({
    isActive,
    isOver,
    className,
    children
}: DropZoneProps) {
    return (
        <div
            className={cn(
                'border-2 border-dashed rounded-lg p-4 text-center transition-colors duration-200',
                isOver && isActive
                    ? 'border-blue-400 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-gray-50 text-gray-500',
                className
            )}
        >
            {children || (
                <div className="space-y-2">
                    <div className="text-2xl">📁</div>
                    <p className="text-sm">
                        {isOver && isActive
                            ? 'Drop files here'
                            : 'Drag and drop files here'
                        }
                    </p>
                </div>
            )}
        </div>
    );
}

/**
 * Sortable list item component
 */
interface SortableItemProps {
    id: string;
    children: React.ReactNode;
    className?: string;
    isDragging?: boolean;
    dragHandle?: boolean;
}

export function SortableItem({
    id,
    children,
    className,
    isDragging = false,
    dragHandle = true,
}: SortableItemProps) {
    return (
        <DraggableItem id={id} className={className}>
            <div className={cn(
                'flex items-center gap-2 p-2 rounded-md border transition-colors',
                isDragging && 'opacity-50 bg-gray-50',
                dragHandle && 'hover:bg-gray-50'
            )}>
                {dragHandle && <DragHandle />}
                <div className="flex-1">
                    {children}
                </div>
            </div>
        </DraggableItem>
    );
}

/**
 * Sortable list component
 */
interface SortableListProps {
    items: Array<{ id: string; content: React.ReactNode }>;
    onReorder?: (oldIndex: number, newIndex: number) => void;
    className?: string;
    renderItem?: (item: { id: string; content: React.ReactNode }, index: number) => React.ReactNode;
}

export function SortableList({
    items,
    onReorder,
    className,
    renderItem,
}: SortableListProps) {
    return (
        <div className={cn('space-y-2', className)}>
            {items.map((item, index) => (
                <div key={item.id}>
                    {renderItem ? renderItem(item, index) : (
                        <SortableItem id={item.id}>
                            {item.content}
                        </SortableItem>
                    )}
                </div>
            ))}
        </div>
    );
}