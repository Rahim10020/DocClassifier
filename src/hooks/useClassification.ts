import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useHistory } from './useHistory';
import type { Classification } from '@/types/classification';
import type { CategoryNode } from '@/types/category';

interface UseClassificationProps {
    initialClassification: Classification;
    initialStructure: CategoryNode[];
}

export function useClassification({ initialClassification, initialStructure }: UseClassificationProps) {
    const { toast } = useToast();
    const { current: structure, push, undo, redo, canUndo, canRedo } = useHistory<CategoryNode[]>({ initialState: initialStructure });
    const [classification, setClassification] = useState(initialClassification);
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const updateStructure = useCallback((newStructure: CategoryNode[]) => {
        push(newStructure);
        setIsDirty(true);
    }, [push]);

    const renameCategory = (id: string, newName: string) => {
        // Implement recursive rename in tree
        const renameNode = (nodes: CategoryNode[]): CategoryNode[] => {
            return nodes.map(node => ({
                ...node,
                name: node.id === id ? newName : node.name,
                children: node.children ? renameNode(node.children) : []
            }));
        };
        const newTree = renameNode(structure);
        updateStructure(newTree);
    };

    const createCategory = (name: string, parentId?: string) => {
        // Implement create category in tree
        const addNode = (nodes: CategoryNode[]): CategoryNode[] => {
            return nodes.map(node => {
                if (node.id === parentId) {
                    const newCategory: CategoryNode = {
                        id: `temp-${Date.now()}`,
                        name,
                        path: `${node.path}/${name}`,
                        parentPath: node.path,
                        children: [],
                        documents: []
                    };
                    return {
                        ...node,
                        children: [...(node.children || []), newCategory]
                    };
                }
                return {
                    ...node,
                    children: node.children ? addNode(node.children) : []
                };
            });
        };
        const newTree = addNode(structure);
        updateStructure(newTree);
    };

    const deleteCategory = (id: string) => {
        // Implement delete category and move documents to root
        const removeNode = (nodes: CategoryNode[]): CategoryNode[] => {
            return nodes
                .filter(node => node.id !== id)
                .map(node => ({
                    ...node,
                    children: node.children ? removeNode(node.children) : []
                }));
        };
        const newTree = removeNode(structure);
        updateStructure(newTree);
    };

    const mergeCategories = async (sourceId: string, targetId: string) => {
        try {
            const res = await fetch(`/api/categories/merge`, {
                method: 'POST',
                body: JSON.stringify({ sourceId, targetId, classificationId: classification.id }),
            });
            if (!res.ok) throw new Error('Merge failed');

            // Update tree by moving documents from source to target
            const mergeNodes = (nodes: CategoryNode[]): CategoryNode[] => {
                return nodes.map(node => {
                    if (node.id === targetId && node.children) {
                        // Find source category and move its documents
                        const moveDocuments = (sourceNodes: CategoryNode[]): { documents: any[], children: CategoryNode[] } => {
                            let movedDocs: any[] = [];
                            const newChildren = sourceNodes.map(n => {
                                if (n.id === sourceId) {
                                    movedDocs = n.documents;
                                    return null;
                                }
                                return n;
                            }).filter(Boolean) as CategoryNode[];

                            return { documents: movedDocs, children: newChildren };
                        };

                        const { documents: movedDocs, children: newChildren } = moveDocuments(structure);
                        return {
                            ...node,
                            documents: [...node.documents, ...movedDocs],
                            children: newChildren
                        };
                    }
                    return {
                        ...node,
                        children: node.children ? mergeNodes(node.children) : []
                    };
                });
            };

            const newTree = mergeNodes(structure);
            updateStructure(newTree);
        } catch (err) {
            toast({ title: 'Erreur', description: 'Fusion échouée', variant: 'destructive' });
        }
    };

    const moveDocument = (docId: string, toCategoryId: string) => {
        // Update document category in structure
        const moveDocInTree = (nodes: CategoryNode[]): CategoryNode[] => {
            return nodes.map(node => {
                // Remove document from current category
                const filteredDocs = node.documents.filter(doc => doc.id !== docId);

                if (node.id === toCategoryId) {
                    // Add document to target category
                    const documentToMove = node.documents.find(doc => doc.id === docId);
                    if (documentToMove) {
                        return {
                            ...node,
                            documents: [...filteredDocs, documentToMove]
                        };
                    }
                }

                return {
                    ...node,
                    documents: filteredDocs,
                    children: node.children ? moveDocInTree(node.children) : []
                };
            });
        };

        const newTree = moveDocInTree(structure);
        updateStructure(newTree);
    };

    const save = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/classification/${classification.id}/update`, {
                method: 'PATCH',
                body: JSON.stringify({ /* changes */ }),
            });
            if (!res.ok) throw new Error('Save failed');
            const updated = await res.json();
            setClassification(updated);
            setIsDirty(false);
            toast({ title: 'Sauvegardé', description: 'Modifications sauvegardées' });
        } catch (err) {
            toast({ title: 'Erreur', description: 'Sauvegarde échouée', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const validate = async () => {
        // Similar to save but set status to validated
    };

    useEffect(() => {
        if (isDirty) {
            const timer = setTimeout(save, 30000);
            return () => clearTimeout(timer);
        }
    }, [isDirty, structure]);

    return {
        classification,
        structure,
        isDirty,
        isSaving,
        renameCategory,
        createCategory,
        deleteCategory,
        mergeCategories,
        moveDocument,
        save,
        validate,
        undo,
        redo,
        canUndo,
        canRedo,
    };
}