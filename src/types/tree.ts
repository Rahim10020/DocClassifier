// Tree node structure for category hierarchy
export interface TreeNode {
    id: string;
    name: string;
    parentId?: string | null;
    children?: TreeNode[];
    level?: number;
    documentCount?: number;
}

// Props for tree components
export interface TreeNodeProps {
    node: TreeNode;
    level: number;
    expanded: Set<string>;
    toggleExpand: (id: string) => void;
}

// Category tree structure
export interface CategoryTree {
    rootNodes: TreeNode[];
    totalNodes: number;
    maxDepth: number;
}