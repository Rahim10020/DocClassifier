// scripts/cleanup.ts
// Script de nettoyage et refactoring automatique du projet

import fs from 'fs';
import path from 'path';

interface CleanupTask {
    name: string;
    action: () => Promise<void>;
    description: string;
}

class ProjectCleanup {
    private rootDir: string;
    private backupDir: string;
    private dryRun: boolean;

    constructor(rootDir: string = process.cwd(), dryRun: boolean = false) {
        this.rootDir = rootDir;
        this.backupDir = path.join(rootDir, '.cleanup-backup');
        this.dryRun = dryRun;
    }

    async run() {
        console.log('🧹 Démarrage du nettoyage du projet...\n');

        if (!this.dryRun) {
            await this.createBackup();
        }

        const tasks: CleanupTask[] = [
            {
                name: 'Fusion des fichiers auth',
                action: () => this.mergeAuthFiles(),
                description: 'Supprime authOptions.ts (doublon)'
            },
            {
                name: 'Consolidation des utilitaires',
                action: () => this.consolidateUtils(),
                description: 'Fusionne helpers.ts et formatters.ts'
            },
            {
                name: 'Nettoyage des composants dnd',
                action: () => this.cleanupDndComponents(),
                description: 'Supprime les composants DnD non utilisés'
            },
            {
                name: 'Suppression des fichiers classifier inutiles',
                action: () => this.cleanupClassifierFiles(),
                description: 'Retire suggester.ts et tfidf.ts non utilisés'
            },
            {
                name: 'Mise à jour des imports',
                action: () => this.updateImports(),
                description: 'Corrige les imports cassés après fusion'
            },
            {
                name: 'Validation finale',
                action: () => this.validate(),
                description: 'Vérifie l\'intégrité du projet'
            }
        ];

        for (const task of tasks) {
            console.log(`\n📦 ${task.name}`);
            console.log(`   ${task.description}`);

            try {
                await task.action();
                console.log(`   ✅ Terminé`);
            } catch (error) {
                console.error(`   ❌ Erreur:`, error);
            }
        }

        console.log('\n\n🎉 Nettoyage terminé!');
        console.log(`\n📊 Statistiques:`);
        await this.printStats();
    }

    private async createBackup() {
        console.log('💾 Création d\'un backup...');

        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const backupPath = path.join(this.backupDir, `backup-${timestamp}`);

        // Copier les fichiers importants
        const filesToBackup = [
            'src/lib/auth/authOptions.ts',
            'src/lib/utils/helpers.ts',
            'src/lib/utils/formatters.ts',
            'src/lib/classifier/suggester.ts',
            'src/lib/classifier/tfidf.ts'
        ];

        fs.mkdirSync(backupPath, { recursive: true });

        for (const file of filesToBackup) {
            const fullPath = path.join(this.rootDir, file);
            if (fs.existsSync(fullPath)) {
                const destPath = path.join(backupPath, path.basename(file));
                fs.copyFileSync(fullPath, destPath);
            }
        }

        console.log(`   ✅ Backup créé: ${backupPath}`);
    }

    private async mergeAuthFiles() {
        const authOptionsPath = path.join(this.rootDir, 'src/lib/auth/authOptions.ts');

        if (fs.existsSync(authOptionsPath)) {
            if (!this.dryRun) {
                fs.unlinkSync(authOptionsPath);
            }
            console.log('   → Supprimé: authOptions.ts');
        }
    }

    private async consolidateUtils() {
        const helpersPath = path.join(this.rootDir, 'src/lib/utils/helpers.ts');
        const formattersPath = path.join(this.rootDir, 'src/lib/utils/formatters.ts');

        if (!fs.existsSync(helpersPath) || !fs.existsSync(formattersPath)) {
            console.log('   ⚠️  Fichiers déjà supprimés ou introuvables');
            return;
        }

        const helpersContent = fs.readFileSync(helpersPath, 'utf-8');
        const formattersContent = fs.readFileSync(formattersPath, 'utf-8');

        // Nouveau contenu consolidé
        const consolidatedContent = `// Consolidated utility functions
// Merged from helpers.ts and formatters.ts

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { File, FileText, FileSpreadsheet } from 'lucide-react';

// ==================== CLASS UTILITIES ====================

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ==================== DATE & TIME UTILITIES ====================

/**
 * Format date to localized string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format duration in milliseconds to human readable string
 */
export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return minutes > 0 ? \`\${minutes}m \${seconds}s\` : \`\${Number(seconds)}s\`;
}

/**
 * Calculate expiration date (24 hours from now)
 */
export function getExpirationDate(): Date {
  const date = new Date();
  date.setHours(date.getHours() + 24);
  return date;
}

/**
 * Check if a classification has expired
 */
export function isExpired(expiresAt: Date | string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

// ==================== FILE UTILITIES ====================

/**
 * Format file size in bytes to human readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file icon component based on MIME type
 */
export function getFileIcon(mimeType: string): React.ComponentType<{ className?: string }> {
  if (mimeType.startsWith('application/pdf')) return FileText;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType === 'text/csv') return FileSpreadsheet;
  return File;
}

/**
 * Generate a unique filename for uploaded files
 */
export function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const extension = originalName.split('.').pop();
  return \`\${timestamp}_\${random}.\${extension}\`;
}

/**
 * Extract file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Check if file type is supported for document processing
 */
export function isSupportedFileType(mimeType: string): boolean {
  const supportedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/msword',
    'application/vnd.ms-excel',
  ];
  return supportedTypes.includes(mimeType);
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFileName(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}

// ==================== SESSION & ID UTILITIES ====================

/**
 * Generate a unique session ID for file uploads
 */
export function generateSessionId(): string {
  return \`session_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
}

// ==================== TEXT UTILITIES ====================

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
}

// ==================== CATEGORY UTILITIES ====================

/**
 * Generate category path from parent path and category name
 */
export function generateCategoryPath(parentPath: string | null, categoryName: string): string {
  if (!parentPath || parentPath === '/') {
    return \`/\${categoryName}\`;
  }
  return \`\${parentPath}/\${categoryName}\`;
}

/**
 * Generate a random color for categories
 */
export function generateCategoryColor(index: number): string {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  ];
  return colors[index % colors.length];
}

// ==================== CALCULATION UTILITIES ====================

/**
 * Calculate total size of documents
 */
export function calculateTotalSize(documents: { fileSize: number }[]): number {
  return documents.reduce((total, doc) => total + doc.fileSize, 0);
}

// ==================== SERIALIZATION UTILITIES ====================

/**
 * Converts BigInt fields to strings recursively for JSON safety
 */
export function serializeBigInt<T>(value: T): T {
  if (value === null || value === undefined) return value;
  if (typeof value === 'bigint') {
    return (value.toString() as unknown) as T;
  }
  if (Array.isArray(value)) {
    return (value.map(serializeBigInt) as unknown) as T;
  }
  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = serializeBigInt(val as never);
    }
    return (result as unknown) as T;
  }
  return value;
}

// ==================== PERFORMANCE UTILITIES ====================

/**
 * Debounce function to limit function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (Array.isArray(obj)) return obj.map(item => deepClone(item)) as any;

  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}
`;

        if (!this.dryRun) {
            // Écrire le nouveau fichier consolidé
            fs.writeFileSync(helpersPath, consolidatedContent, 'utf-8');

            // Supprimer formatters.ts
            fs.unlinkSync(formattersPath);
        }

        console.log('   → Consolidé: helpers.ts + formatters.ts → helpers.ts');
        console.log('   → Supprimé: formatters.ts');
    }

    private async cleanupDndComponents() {
        const unnecessaryDnd = [
            'src/components/dnd/DragOverlay.tsx', // Fonctionnalités avancées non utilisées
        ];

        for (const file of unnecessaryDnd) {
            const fullPath = path.join(this.rootDir, file);
            if (fs.existsSync(fullPath)) {
                if (!this.dryRun) {
                    fs.unlinkSync(fullPath);
                }
                console.log(`   → Supprimé: ${file}`);
            }
        }
    }

    private async cleanupClassifierFiles() {
        const unnecessaryClassifier = [
            'src/lib/classifier/suggester.ts',
            'src/lib/classifier/tfidf.ts',
        ];

        for (const file of unnecessaryClassifier) {
            const fullPath = path.join(this.rootDir, file);
            if (fs.existsSync(fullPath)) {
                if (!this.dryRun) {
                    fs.unlinkSync(fullPath);
                }
                console.log(`   → Supprimé: ${file}`);
            }
        }
    }

    private async updateImports() {
        console.log('   → Mise à jour des imports...');

        const filesToUpdate = [
            // Tous les fichiers qui importent depuis formatters.ts
            'src/components/upload/FileItem.tsx',
            'src/components/upload/UploadSummary.tsx',
            'src/components/review/DocumentItem.tsx',
            'src/components/profile/UserStats.tsx',
            'src/lib/storage/fileManager.ts',
        ];

        for (const file of filesToUpdate) {
            const fullPath = path.join(this.rootDir, file);
            if (fs.existsSync(fullPath)) {
                let content = fs.readFileSync(fullPath, 'utf-8');

                // Remplacer les imports de formatters par helpers
                content = content.replace(
                    /from ['"]@\/lib\/utils\/formatters['"]/g,
                    "from '@/lib/utils/helpers'"
                );

                if (!this.dryRun) {
                    fs.writeFileSync(fullPath, content, 'utf-8');
                }
                console.log(`   → Mis à jour: ${file}`);
            }
        }
    }

    private async validate() {
        console.log('   → Vérification de l\'intégrité...');

        const criticalFiles = [
            'src/lib/auth/auth.config.ts',
            'src/lib/utils/helpers.ts',
            'src/lib/classifier/categorizer.ts',
            'src/lib/classifier/textExtractor.ts',
        ];

        let allValid = true;

        for (const file of criticalFiles) {
            const fullPath = path.join(this.rootDir, file);
            if (!fs.existsSync(fullPath)) {
                console.error(`   ❌ Fichier critique manquant: ${file}`);
                allValid = false;
            }
        }

        if (allValid) {
            console.log('   ✅ Tous les fichiers critiques sont présents');
        }
    }

    private async printStats() {
        const srcDir = path.join(this.rootDir, 'src');

        const countFiles = (dir: string, ext: string): number => {
            if (!fs.existsSync(dir)) return 0;

            let count = 0;
            const items = fs.readdirSync(dir);

            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    count += countFiles(fullPath, ext);
                } else if (item.endsWith(ext)) {
                    count++;
                }
            }

            return count;
        };

        const tsFiles = countFiles(srcDir, '.ts') + countFiles(srcDir, '.tsx');

        console.log(`   - Fichiers TypeScript: ${tsFiles}`);
        console.log(`   - Backup disponible: ${this.backupDir}`);
    }
}

// Exécution du script
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

if (dryRun) {
    console.log('🔍 Mode DRY RUN - Aucune modification ne sera effectuée\n');
}

const cleanup = new ProjectCleanup(process.cwd(), dryRun);
cleanup.run().catch(console.error);