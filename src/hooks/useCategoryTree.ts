import { useState, useMemo } from 'react';
import { CategoryNode } from '@/types/category';
import { DocumentMetadata } from '@/types/document';

interface UseCategoryTreeReturn {
    expanded: Set<string>;
    toggleExpand: (id: string) => void;
    selectedDocument: string | null;
    selectDocument: (docId: string) => void;
    getDocumentById: (docId: string) => DocumentMetadata | undefined;
    getCategoryById: (catId: string) => CategoryNode | undefined;
}

export function useCategoryTree(initialTree: CategoryNode[] = [], initialDocuments: DocumentMetadata[] = []): UseCategoryTreeReturn {
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpanded((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const selectDocument = (docId: string) => setSelectedDocument(docId);

    const flatTree = useMemo(() => {
        const flatten = (nodes: CategoryNode[]): CategoryNode[] => {
            return nodes.reduce((acc, node) => {
                acc.push(node);
                if (node.children) {
                    acc.push(...flatten(node.children));
                }
                return acc;
            }, [] as CategoryNode[]);
        };
        return flatten(initialTree);
    }, [initialTree]);

    const getCategoryById = (catId: string) => flatTree.find((node) => node.id === catId);

    const getDocumentById = (docId: string) => initialDocuments.find((doc) => doc.id === docId);

    return {
        expanded,
        toggleExpand,
        selectedDocument,
        selectDocument,
        getDocumentById,
        getCategoryById,
    };
}