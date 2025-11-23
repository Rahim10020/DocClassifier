/**
 * @fileoverview Hooks pour le drag-and-drop des documents.
 *
 * Ce module fournit des hooks pour implémenter le glisser-déposer des documents
 * entre les catégories en utilisant la bibliothèque @dnd-kit.
 *
 * @module hooks/useDragAndDrop
 * @author DocClassifier Team
 */

import { useState, useCallback } from 'react';
import {
    DragEndEvent,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { Document } from '@/types/document';

/**
 * Options de configuration du hook useDragAndDrop.
 *
 * @interface UseDragAndDropOptions
 * @property {Document[]} documents - Liste des documents draggables
 * @property {Function} onDocumentMove - Callback appelé lors d'un déplacement
 */
interface UseDragAndDropOptions {
    documents: Document[];
    onDocumentMove: (documentId: string, newCategory: string, newSubCategory?: string) => Promise<void>;
}

/**
 * Hook principal pour gérer le drag-and-drop des documents.
 *
 * Configure les sensors et gère les événements de drag.
 *
 * @function useDragAndDrop
 * @param {UseDragAndDropOptions} options - Options de configuration
 * @returns {Object} Sensors et handlers pour DndContext
 *
 * @example
 * const {
 *   sensors,
 *   handleDragStart,
 *   handleDragEnd,
 *   isDragging
 * } = useDragAndDrop({
 *   documents,
 *   onDocumentMove: handleMove
 * });
 */
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

/**
 * Hook utilitaire pour rendre un élément draggable.
 *
 * @function useDraggable
 * @param {string} id - Identifiant unique de l'élément
 * @returns {Object} Props à passer à useDraggable de @dnd-kit
 */
export function useDraggable(id: string) {
    return {
        id,
        data: { id },
    };
}

/**
 * Hook utilitaire pour créer une zone de drop.
 *
 * @function useDroppable
 * @param {string} category - Catégorie cible
 * @param {string} [subCategory] - Sous-catégorie cible optionnelle
 * @returns {Object} Props à passer à useDroppable de @dnd-kit
 */
export function useDroppable(category: string, subCategory?: string) {
    return {
        id: subCategory ? `${category}-${subCategory}` : category,
        data: {
            category,
            subCategory,
        },
    };
}