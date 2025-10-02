import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils/cn';
import { CategoryNode } from '@/types/category';

interface DroppableCategoryProps {
    category: CategoryNode;
    children: React.ReactNode;
}

export default function DroppableCategory({ category, children }: DroppableCategoryProps) {
    const { isOver, setNodeRef } = useDroppable({
        id: category.id || '',
        data: { type: 'category' },
    });

    return (
        <div
            ref={setNodeRef}
            className={cn('transition-colors', isOver ? 'bg-accent/50' : '')}
        >
            {children}
        </div>
    );
}