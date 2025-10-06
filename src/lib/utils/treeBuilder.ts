import { TreeNode } from '@/types/tree';

// Assume proposedStructure is { categories: [{id, name, parentId?, documents: []}] }
export function buildTree(proposedStructure: any): TreeNode[] {
    // Validate input
    if (!proposedStructure) {
        console.warn('buildTree: proposedStructure is undefined or null');
        return [];
    }
    
    if (!proposedStructure.categories || !Array.isArray(proposedStructure.categories)) {
        console.warn('buildTree: proposedStructure.categories is not an array');
        return [];
    }
    
    const nodes: TreeNode[] = proposedStructure.categories
        .filter((cat: any) => cat && cat.id && cat.name) // Filter out invalid categories
        .map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            children: [],
        }));

    const tree: TreeNode[] = [];
    const map: { [key: string]: TreeNode } = {};

    nodes.forEach((node) => {
        map[node.id] = node;
    });

    nodes.forEach((node) => {
        if (node.parentId) {
            const parent = map[node.parentId];
            if (parent) {
                parent.children?.push(node);
            }
        } else {
            tree.push(node);
        }
    });

    return tree;
}

export function flattenTree(tree: TreeNode[]): TreeNode[] {
    let flat: TreeNode[] = [];
    tree.forEach((node) => {
        flat.push(node);
        if (node.children) {
            flat = flat.concat(flattenTree(node.children));
        }
    });
    return flat;
}

export function findNodeById(tree: TreeNode[], id: string): TreeNode | undefined {
    for (const node of tree) {
        if (node.id === id) return node;
        if (node.children) {
            const found = findNodeById(node.children, id);
            if (found) return found;
        }
    }
    return undefined;
}