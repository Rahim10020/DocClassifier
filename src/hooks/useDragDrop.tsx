import { useState } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

interface UseDragDropProps {
    onMoveDocument: (docId: string, fromCatId: string, toCatId: string) => void;
}

export function useDragDrop({ onMoveDocument }: UseDragDropProps) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [overId, setOverId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            const activeData = active.data.current;
            if (activeData?.type === 'document' && over.data.current?.type === 'category') {
                onMoveDocument(active.id as string, activeData.categoryId, over.id as string);
            }
        }
        setActiveId(null);
        setOverId(null);
    };

    return {
        DndContextProvider: ({ children }: { children: React.ReactNode }) => (
            <DndContext
        sensors= { sensors }
        onDragStart={({ active }) => setActiveId(active.id as string)
    }
    onDragOver = {({ over }) => setOverId(over?.id as string | null)
}
onDragEnd = { handleDragEnd }
    >
    { children }
{/* DragOverlay can be implemented if needed */ }
</DndContext>
    ),
activeId,
    overId,
  };
}