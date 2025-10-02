import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { DocumentMetadata } from '@/types/document';

interface DraggableDocumentProps {
    document: DocumentMetadata;
    categoryId: string;
    children: React.ReactNode;
}

export default function DraggableDocument({ document, categoryId, children }: DraggableDocumentProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: document.id,
        data: { type: 'document', categoryId },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing"
        >
            {children}
        </div>
    );
}