'use client';

import { useCategoryTree } from '@/hooks/useCategoryTree';
import CategoryNode from './CategoryNode';
import { CategoryNode as CategoryNodeType } from '@/types/category';
import { DocumentMetadata } from '@/types/document';

interface CategoryTreeProps {
    tree: CategoryNodeType[];
    documents: DocumentMetadata[]; // From types/document.ts
}

export default function CategoryTree({ tree, documents }: CategoryTreeProps) {
    const { expanded, toggleExpand, selectedDocument, selectDocument } = useCategoryTree(tree);

    return (
        <div className="space-y-2">
            {tree.map((node) => (
                <CategoryNode
                    key={node.id}
                    node={node}
                    level={0}
                    expanded={expanded}
                    toggleExpand={toggleExpand}
                    selectedDocument={selectedDocument}
                    selectDocument={selectDocument}
                    documents={documents}
                />
            ))}
        </div>
    );
}