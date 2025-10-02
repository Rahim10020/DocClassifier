import prisma from '../prisma';

// Define the Document type based on Prisma schema
type Document = {
    id: string;
    classificationId: string;
    originalName: string;
    filename: string;
    fileSize: number;
    mimeType: string;
    categoryName?: string | null;
    categoryPath?: string | null;
    confidence?: number | null;
    extractedText?: string | null;
    createdAt: Date;
};

/**
 * Creates document metadata.
 * @param data - Document data.
 * @returns Created document.
 * @throws Error on DB failure.
 */
export async function createDocumentMetadata(data: Omit<Document, 'id'>): Promise<Document> {
    try {
        return await prisma.document.create({ data });
    } catch (error) {
        console.error('Error creating document metadata:', error);
        throw new Error('Database creation failed.');
    }
}

/**
 * Bulk creates documents.
 * @param data - Array of document data.
 * @returns Array of created documents.
 * @throws Error on DB failure.
 */
export async function bulkCreateDocuments(data: Omit<Document, 'id'>[]): Promise<Document[]> {
    try {
        return await prisma.$transaction(
            data.map((item) => prisma.document.create({ data: item }))
        );
    } catch (error) {
        console.error('Error bulk creating documents:', error);
        throw new Error('Database bulk creation failed.');
    }
}

/**
 * Gets documents by classification ID.
 * @param classificationId - Classification ID.
 * @returns Array of documents.
 * @throws Error on DB failure.
 */
export async function getDocumentsByClassificationId(classificationId: string): Promise<Document[]> {
    try {
        return await prisma.document.findMany({ where: { classificationId } });
    } catch (error) {
        console.error('Error fetching documents:', error);
        throw new Error('Database query failed.');
    }
}