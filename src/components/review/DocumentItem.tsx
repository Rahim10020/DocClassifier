import { FileIcon } from 'lucide-react';
import ConfidenceIndicator from './ConfidenceIndicator';
import { DocumentMetadata } from '@/types/document';
import { formatBytes } from '@/lib/utils/helpers';
import DraggableDocument from '@/components/dnd/DraggableDocument';

interface DocumentItemProps {
    document: DocumentMetadata;
    isSelected: boolean;
    onSelect: () => void;
}

export default function DocumentItem({ document, isSelected, onSelect }: DocumentItemProps) {
    const fileTypeIcon = <FileIcon className="w-4 h-4 mr-2" />;

    return (
        <DraggableDocument document={document} categoryId="">
            <div
                className={`flex items-center p-2 rounded cursor-pointer ${isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                onClick={onSelect}
            >
                {fileTypeIcon}
                <span className="flex-1 truncate">{document.originalName}</span>
                <span className="text-sm text-muted-foreground mr-2">{formatBytes(document.fileSize)}</span>
                <ConfidenceIndicator confidence={document.confidence || 0} size="small" />
            </div>
        </DraggableDocument>
    );
}