import { ChevronDown, ChevronRight, Folder, FolderOpen } from 'lucide-react';
import DocumentItem from './DocumentItem';
import { CategoryNode as CategoryNodeType } from '@/types/category';
import { DocumentMetadata } from '@/types/document';
import { useState } from 'react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import DroppableCategory from '@/components/dnd/DroppableCategory';

interface CategoryNodeProps {
    node: CategoryNodeType;
    level: number;
    expanded: Set<string>;
    toggleExpand: (id: string) => void;
    selectedDocument: string | null;
    selectDocument: (docId: string) => void;
    documents: DocumentMetadata[];
}

export default function CategoryNode({
    node,
    level,
    expanded,
    toggleExpand,
    selectedDocument,
    selectDocument,
    documents,
}: CategoryNodeProps) {
    const isExpanded = expanded.has(node.id || '');
    const indent = level * 20;
    const [editing, setEditing] = useState(false);

    return (
        <ContextMenu>
            <ContextMenuTrigger>
                <DroppableCategory category={node}>
                    <div style={{ marginLeft: `${indent}px` }}>
                        <div
                            className="flex items-center cursor-pointer hover:bg-accent p-2 rounded"
                            onClick={() => toggleExpand(node.id || '')}
                            onDoubleClick={() => setEditing(true)}
                        >
                            {isExpanded ? (
                                <ChevronDown className="w-4 h-4 mr-2" />
                            ) : (
                                <ChevronRight className="w-4 h-4 mr-2" />
                            )}
                            {isExpanded ? (
                                <FolderOpen className="w-4 h-4 mr-2" />
                            ) : (
                                <Folder className="w-4 h-4 mr-2" />
                            )}
                            <span className="font-medium">{node.name}</span>
                            <span className="ml-2 text-muted-foreground">({node.documents.length})</span>
                        </div>

                        {isExpanded && (
                            <div className="space-y-1 mt-1">
                                {node.children?.map((child) => (
                                    <CategoryNode
                                        key={child.id}
                                        node={child}
                                        level={level + 1}
                                        expanded={expanded}
                                        toggleExpand={toggleExpand}
                                        selectedDocument={selectedDocument}
                                        selectDocument={selectDocument}
                                        documents={documents}
                                    />
                                ))}

                                {node.documents.map((doc) => (
                                    <DocumentItem
                                        key={doc.id}
                                        document={doc}
                                        isSelected={selectedDocument === doc.id}
                                        onSelect={() => selectDocument(doc.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </DroppableCategory>
            </ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem onClick={() => {
                    const newName = prompt('Nouveau nom de la catégorie:', node.name);
                    if (newName && newName.trim()) {
                        // TODO: Implement category renaming logic
                        console.log('Renaming category', node.id, 'to', newName);
                    }
                }}>Renommer</ContextMenuItem>
                <ContextMenuItem>Créer sous-catégorie</ContextMenuItem>
                <ContextMenuItem>Supprimer</ContextMenuItem>
                <ContextMenuItem>Fusionner</ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}