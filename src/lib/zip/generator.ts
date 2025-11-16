import archiver from 'archiver';
import { createWriteStream } from 'fs';
import fs from 'fs-extra';
import path from 'path';
import { Document } from '@/types/document';
import { ExportOptions } from '@/types/session';
import { getFilePath } from '../storage';
import { SYSTEM_CATEGORIES } from '../classification/constants';

export interface ZipGenerationResult {
    zipPath: string;
    size: number;
    fileCount: number;
}

export async function generateZip(
    sessionId: string,
    documents: Document[],
    options: ExportOptions
): Promise<ZipGenerationResult> {
    const zipPath = path.join('./temp', `${sessionId}.zip`);
    const output = createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    return new Promise((resolve, reject) => {
        output.on('close', () => {
            resolve({
                zipPath,
                size: archive.pointer(),
                fileCount: documents.length,
            });
        });

        archive.on('error', (err) => {
            reject(err);
        });

        archive.pipe(output);

        // Ajouter les fichiers selon la structure choisie
        if (options.structure === 'hierarchical') {
            addFilesHierarchical(archive, sessionId, documents);
        } else {
            addFilesFlat(archive, sessionId, documents);
        }

        // Ajouter un README si demandé
        if (options.includeReadme) {
            const readme = generateReadme(documents, options.structure);
            archive.append(readme, { name: 'README.txt' });
        }

        archive.finalize();
    });
}

function addFilesHierarchical(
    archive: archiver.Archiver,
    sessionId: string,
    documents: Document[]
): void {
    // Grouper par catégorie
    const grouped = documents.reduce((acc, doc) => {
        const category = doc.mainCategory || SYSTEM_CATEGORIES.UNCATEGORIZED;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(doc);
        return acc;
    }, {} as Record<string, Document[]>);

    // Ajouter chaque fichier dans son dossier de catégorie
    for (const [category, docs] of Object.entries(grouped)) {
        docs.forEach(doc => {
            const filePath = getFilePath(sessionId, doc.fileName);
            const destPath = doc.subCategory
                ? `${category}/${doc.subCategory}/${doc.originalName}`
                : `${category}/${doc.originalName}`;

            archive.file(filePath, { name: destPath });
        });
    }
}

function addFilesFlat(
    archive: archiver.Archiver,
    sessionId: string,
    documents: Document[]
): void {
    documents.forEach(doc => {
        const filePath = getFilePath(sessionId, doc.fileName);

        // Préfixer avec la catégorie dans le nom
        const prefix = doc.mainCategory ? `[${doc.mainCategory}]_` : '';
        const destName = `${prefix}${doc.originalName}`;

        archive.file(filePath, { name: destName });
    });
}

function generateReadme(documents: Document[], structure: string): string {
    const lines: string[] = [];

    lines.push('='.repeat(60));
    lines.push('CLASSIFIER - Documents classifiés');
    lines.push('='.repeat(60));
    lines.push('');
    lines.push(`Date de génération: ${new Date().toLocaleString('fr-FR')}`);
    lines.push(`Nombre de documents: ${documents.length}`);
    lines.push(`Structure: ${structure === 'hierarchical' ? 'Hiérarchique' : 'Plate'}`);
    lines.push('');
    lines.push('='.repeat(60));
    lines.push('LISTE DES DOCUMENTS');
    lines.push('='.repeat(60));
    lines.push('');

    if (structure === 'hierarchical') {
        // Grouper par catégorie
        const grouped = documents.reduce((acc, doc) => {
            const category = doc.mainCategory || SYSTEM_CATEGORIES.UNCATEGORIZED;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(doc);
            return acc;
        }, {} as Record<string, Document[]>);

        for (const [category, docs] of Object.entries(grouped)) {
            lines.push(`\n📁 ${category}`);
            lines.push('-'.repeat(60));

            docs.forEach(doc => {
                const confidence = doc.confidence ? `(${Math.round(doc.confidence * 100)}%)` : '';
                const subCat = doc.subCategory ? ` > ${doc.subCategory}` : '';
                lines.push(`  • ${doc.originalName}${subCat} ${confidence}`);
            });
        }
    } else {
        documents.forEach((doc, index) => {
            const category = doc.mainCategory || SYSTEM_CATEGORIES.UNCATEGORIZED;
            const subCat = doc.subCategory ? ` > ${doc.subCategory}` : '';
            const confidence = doc.confidence ? `(${Math.round(doc.confidence * 100)}%)` : '';
            lines.push(`${index + 1}. [${category}${subCat}] ${doc.originalName} ${confidence}`);
        });
    }

    lines.push('');
    lines.push('='.repeat(60));
    lines.push('STATISTIQUES');
    lines.push('='.repeat(60));
    lines.push('');

    // Compter par catégorie
    const categoryCounts = documents.reduce((acc, doc) => {
        const category = doc.mainCategory || SYSTEM_CATEGORIES.UNCATEGORIZED;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    for (const [category, count] of Object.entries(categoryCounts)) {
        const percentage = Math.round((count / documents.length) * 100);
        lines.push(`${category}: ${count} documents (${percentage}%)`);
    }

    lines.push('');
    lines.push('='.repeat(60));
    lines.push('Généré par Classifier v1.0');
    lines.push('='.repeat(60));

    return lines.join('\n');
}

export async function cleanupZip(zipPath: string): Promise<void> {
    if (await fs.pathExists(zipPath)) {
        await fs.remove(zipPath);
    }
}