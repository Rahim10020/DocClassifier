import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import type { Classification } from '@/types/classification';
import type { TempStorage } from './tempStorage'; // Assume TempStorage class exists

export class ZipGenerator {
    static async generateZip(classification: Classification, tempStorage: TempStorage): Promise<NodeJS.ReadableStream> {
        const archive = archiver('zip', { zlib: { level: 9 } });

        // Parse finalStructure assuming it's a JSON string representing tree
        const structure = JSON.parse(classification.finalStructure || '{}');
        const rootPath = '';

        // Recursive function to add directories and files
        const addToArchive = (node: any, currentPath: string) => {
            const dirPath = path.join(currentPath, node.name);
            archive.directory(dirPath, false); // Create empty dir if no files, but we'll add files

            // Add documents
            node.documents?.forEach((doc: any) => {
                const filePath = tempStorage.getFilePath(doc.id); // Assume method to get temp file path
                if (fs.existsSync(filePath)) {
                    archive.file(filePath, { name: path.join(dirPath, doc.name) });
                }
            });

            // Recurse subcategories
            node.children?.forEach((child: any) => addToArchive(child, dirPath));
        };

        // Start from root categories
        structure.categories?.forEach((cat: any) => addToArchive(cat, rootPath));

        archive.finalize();

        return archive;
    }
}