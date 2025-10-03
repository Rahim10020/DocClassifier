import prisma from '../prisma';
import { CategoryStructure } from '@/types/classification';

/**
 * Get all categories for a specific classification
 */
export async function getCategoriesByClassificationId(classificationId: string): Promise<CategoryStructure[]> {
    const documents = await prisma.documentMetadata.findMany({
        where: { classificationId },
        orderBy: { categoryPath: 'asc' },
    });

    // Group documents by category path and build tree structure
    const categoryMap = new Map<string, CategoryStructure>();

    for (const doc of documents) {
        if (!doc.categoryPath) continue;

        const pathParts = doc.categoryPath.split('/').filter(Boolean);
        let currentPath = '';

        for (let i = 0; i < pathParts.length; i++) {
            const part = pathParts[i];
            currentPath = currentPath ? `${currentPath}/${part}` : `/${part}`;

            if (!categoryMap.has(currentPath)) {
                categoryMap.set(currentPath, {
                    name: part,
                    path: currentPath,
                    children: [],
                    documents: [],
                });
            }

            // Add document to this category if it's the final level
            if (i === pathParts.length - 1) {
                const category = categoryMap.get(currentPath)!;
                if (!category.documents) category.documents = [];
                category.documents.push(doc as any);
            }
        }
    }

    // Build tree structure
    const rootCategories: CategoryStructure[] = [];
    for (const category of categoryMap.values()) {
        const parentPath = category.path.substring(0, category.path.lastIndexOf('/')) || '/';

        if (parentPath === '/') {
            rootCategories.push(category);
        } else {
            const parent = categoryMap.get(parentPath);
            if (parent && parent.children) {
                parent.children.push(category);
            }
        }
    }

    return rootCategories;
}

/**
 * Get unique category paths for a classification
 */
export async function getCategoryPaths(classificationId: string): Promise<string[]> {
    const documents = await prisma.documentMetadata.findMany({
        where: { classificationId },
        select: { categoryPath: true },
        distinct: ['categoryPath'],
    });

    return documents
        .map(doc => doc.categoryPath)
        .filter(Boolean) as string[];
}

/**
 * Get category statistics for a classification
 */
export async function getCategoryStats(classificationId: string): Promise<Array<{
    path: string;
    name: string;
    documentCount: number;
    totalSize: number;
}>> {
    const result = await prisma.documentMetadata.groupBy({
        by: ['categoryPath'],
        where: {
            classificationId,
            categoryPath: { not: null },
        },
        _count: { id: true },
        _sum: { fileSize: true },
    });

    return result.map(item => ({
        path: item.categoryPath!,
        name: item.categoryPath!.split('/').pop() || 'Root',
        documentCount: item._count.id,
        totalSize: item._sum.fileSize || 0,
    }));
}

/**
 * Update document category assignment
 */
export async function updateDocumentCategory(
    documentId: string,
    categoryName: string,
    categoryPath: string,
    confidence?: number
): Promise<void> {
    await prisma.documentMetadata.update({
        where: { id: documentId },
        data: {
            categoryName,
            categoryPath,
            confidence,
        },
    });
}

/**
 * Bulk update document categories
 */
export async function bulkUpdateDocumentCategories(
    updates: Array<{
        documentId: string;
        categoryName: string;
        categoryPath: string;
        confidence?: number;
    }>
): Promise<void> {
    await prisma.$transaction(
        updates.map(update =>
            prisma.documentMetadata.update({
                where: { id: update.documentId },
                data: {
                    categoryName: update.categoryName,
                    categoryPath: update.categoryPath,
                    confidence: update.confidence,
                },
            })
        )
    );
}

/**
 * Get documents by category path
 */
export async function getDocumentsByCategory(
    classificationId: string,
    categoryPath: string
): Promise<Array<{
    id: string;
    originalName: string;
    filename: string;
    fileSize: number;
    mimeType: string;
    confidence?: number | null;
    createdAt: Date;
}>> {
    const documents = await prisma.documentMetadata.findMany({
        where: {
            classificationId,
            categoryPath,
        },
        select: {
            id: true,
            originalName: true,
            filename: true,
            fileSize: true,
            mimeType: true,
            confidence: true,
            createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
    });

    return documents.map(doc => ({
        ...doc,
        confidence: doc.confidence ?? undefined,
    }));
}

/**
 * Get category suggestions based on document content and existing classifications
 */
export async function getCategorySuggestions(
    classificationId: string,
    limit: number = 10
): Promise<string[]> {
    // Get all category paths from this classification
    const categoryPaths = await getCategoryPaths(classificationId);

    // Extract unique category names (last part of path)
    const categoryNames = categoryPaths
        .map(path => path.split('/').pop())
        .filter(Boolean) as string[];

    // Remove duplicates and return top suggestions
    return [...new Set(categoryNames)].slice(0, limit);
}

/**
 * Validate category structure consistency
 */
export async function validateCategoryStructure(classificationId: string): Promise<{
    isValid: boolean;
    issues: string[];
}> {
    const issues: string[] = [];
    const documents = await prisma.documentMetadata.findMany({
        where: { classificationId },
        select: { categoryPath: true, categoryName: true },
    });

    // Check for documents with missing category information
    const missingCategories = documents.filter(
        doc => !doc.categoryPath || !doc.categoryName
    );

    if (missingCategories.length > 0) {
        issues.push(`${missingCategories.length} documents are missing category assignments`);
    }

    // Check for orphaned documents (category path doesn't match category name)
    const orphanedDocuments = documents.filter(
        doc => doc.categoryPath && doc.categoryName &&
            !doc.categoryPath.endsWith(`/${doc.categoryName}`)
    );

    if (orphanedDocuments.length > 0) {
        issues.push(`${orphanedDocuments.length} documents have inconsistent category paths`);
    }

    return {
        isValid: issues.length === 0,
        issues,
    };
}