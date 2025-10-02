import { Badge } from '@/components/ui/badge';
import CategoryTree from '@/components/review/CategoryTree'; // Reuse, but read-only
import ClassificationStats from '@/components/review/ClassificationStats';
import DownloadButton from '@/components/common/DownloadButton';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import type { Classification } from '@/types/classification';
import { formatDate } from '@/lib/utils/formatters';

interface ClassificationDetailsProps {
    classification: Classification;
}

export default function ClassificationDetails({ classification }: ClassificationDetailsProps) {
    // Assume fetch documents if needed
    const documents = []; // Fetch

    return (
        <div className="space-y-6">
            {/* Metadata */}
            <div>
                <h1 className="text-2xl font-bold">{classification.name}</h1>
                <p>Créé le: {formatDate(classification.createdAt)}</p>
                <Badge>{classification.status}</Badge>
            </div>

            {/* Stats */}
            <ClassificationStats /* props */ />

            {/* Structure */}
            <div>
                <h2 className="text-xl font-semibold">Structure</h2>
                <CategoryTree tree={/* parse finalStructure */} documents={documents} readOnly={true} />
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
                {classification.status === 'DOWNLOADED' && <DownloadButton classificationId={classification.id} />}
                <Button variant="destructive">
                    <Trash className="w-4 h-4 mr-2" />
                    Supprimer
                </Button>
            </div>
        </div>
    );
}