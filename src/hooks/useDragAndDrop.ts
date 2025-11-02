import { useState, useCallback } from 'react';
import {
    DragEndEvent,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { Document } from '@/types/document';

interface UseDragAndDropOptions {
    documents: Document[];
    onDocumentMove: (documentId: string, newCategory: string, newSubCategory?: string) => Promise<void>;
}

export function useDragAndDrop(options: UseDragAndDropOptions) {
    const { documents, onDocumentMove } = options;

    const [activeId, setActiveId] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px de mouvement avant d'activer le drag
            },
        })
    );

    const activeDocument = activeId
        ? documents.find(doc => doc.id === activeId)
        : null;

    const handleDragStart = useCallback((event: DragStartEvent) => {
        setActiveId(event.active.id as string);
        setIsDragging(true);
    }, []);

    const handleDragEnd = useCallback(
        async (event: DragEndEvent) => {
            const { active, over } = event;

            setActiveId(null);
            setIsDragging(false);

            if (!over) return;

            const documentId = active.id as string;
            const targetData = over.data.current;

            if (!targetData) return;

            const { category, subCategory } = targetData as {
                category: string;
                subCategory?: string;
            };

            try {
                await onDocumentMove(documentId, category, subCategory);
            } catch (error) {
                console.error('Erreur lors du déplacement:', error);
            }
        },
        [onDocumentMove]
    );

    const handleDragCancel = useCallback(() => {
        setActiveId(null);
        setIsDragging(false);
    }, []);

    return {
        sensors,
        activeId,
        activeDocument,
        isDragging,
        handleDragStart,
        handleDragEnd,
        handleDragCancel,
    };
}

// Hook pour les éléments draggables
export function useDraggable(id: string) {
    return {
        id,
        data: { id },
    };
}

// Hook pour les zones de drop
export function useDroppable(category: string, subCategory?: string) {
    return {
        id: subCategory ? `${category}-${subCategory}` : category,
        data: {
            category,
            subCategory,
        },
    };
}