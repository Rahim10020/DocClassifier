import { Badge } from '@/components/ui/badge';
import CategoryTree from '@/components/review/CategoryTree';
import ClassificationStats from '@/components/review/ClassificationStats';
import DownloadButton from '@/components/common/DownloadButton';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import type { Classification } from '@/types/classification';
import { formatDate } from '@/lib/utils/formatters';
import type { DocumentMetadata } from '@/types/document';

interface ClassificationDetailsProps {
    classification: {
        id: string;
        userId: string;
        sessionId: string;
        status: any;
        proposedStructure: any;
        finalStructure?: any;
        totalDocuments: number;
        totalSize: bigint;
        createdAt: Date;
        processedAt?: Date;
        validatedAt?: Date;
        downloadedAt?: Date;
        expiresAt?: Date;
    };
}

export default function ClassificationDetails({ classification }: ClassificationDetailsProps) {
    // For now, use empty documents array - this should be fetched if needed
    const documents: DocumentMetadata[] = [];

    // Calculate stats from available data
    const stats = {
        totalDocs: classification.totalDocuments,
        categoryCount: classification.finalStructure ?
            (classification.finalStructure as any[]).length : 0,
        avgConfidence: 0.85, // Default value - should be calculated from documents
        breakdown: { high: 0, medium: 0, low: 0 } // Should be calculated from documents
    };

    return (
        <div className="space-y-6">
            {/* Metadata */}
            <div>
                <h1 className="text-2xl font-bold">
                    {`Classification ${classification.id.slice(0, 8)}` || 'Classification sans nom'}
                </h1>
                <p>Créé le: {formatDate(classification.createdAt)}</p>
                <Badge>{classification.status}</Badge>
            </div>

            {/* Stats */}
            <ClassificationStats {...stats} />

            {/* Structure */}
            <div>
                <h2 className="text-xl font-semibold">Structure</h2>
                {classification.finalStructure ? (
                    <CategoryTree
                        tree={classification.finalStructure as any}
                        documents={documents}
                    />
                ) : (
                    <div className="text-gray-500 italic">
                        {classification.status === 'PROCESSING'
                            ? 'Structure en cours de traitement...'
                            : 'Aucune structure finale disponible'
                        }
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
                {classification.status === 'DOWNLOADED' && (
                    <DownloadButton classificationId={classification.id} />
                )}
                <Button variant="destructive">
                    <Trash className="w-4 h-4 mr-2" />
                    Supprimer
                </Button>
            </div>
        </div>
    );
}