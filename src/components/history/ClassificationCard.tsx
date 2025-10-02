import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, FileText, Folder, Trash, Download } from 'lucide-react';
import Link from 'next/link';
import type { Classification } from '@/types/classification';
import { formatDate } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';

interface ClassificationCardProps {
    classification: Classification;
}

export default function ClassificationCard({ classification }: ClassificationCardProps) {
    const isDownloadable = classification.status === 'DOWNLOADED' && !isExpired(classification.expiresAt);

    return (
        <Card className="bg-background/80 backdrop-blur-md shadow-lg border"> {/* Glassmorphism */}
            <CardHeader>
                <CardTitle className="text-lg">{classification.name || 'Classification sans nom'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(classification.createdAt)}
                </div>
                <Badge variant={getStatusVariant(classification.status)}>{classification.status}</Badge>
                <div className="flex items-center text-sm">
                    <FileText className="w-4 h-4 mr-2" />
                    {classification.documentCount} documents
                </div>
                <div className="flex items-center text-sm">
                    <Folder className="w-4 h-4 mr-2" />
                    {classification.categoryCount} catégories
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Link href={`/dashboard/history/${classification.id}`}>
                    <Button variant="outline">Voir détails</Button>
                </Link>
                {isDownloadable && (
                    <Button variant="secondary">
                        <Download className="w-4 h-4 mr-2" />
                        Re-télécharger
                    </Button>
                )}
                <Button variant="destructive">
                    <Trash className="w-4 h-4" />
                </Button>
            </CardFooter>
        </Card>
    );
}

function getStatusVariant(status: string) {
    switch (status) {
        case 'DOWNLOADED': return 'success';
        case 'EXPIRED': return 'destructive';
        default: return 'default';
    }
}

function isExpired(expiresAt: Date | null) {
    return expiresAt && new Date() > new Date(expiresAt);
}