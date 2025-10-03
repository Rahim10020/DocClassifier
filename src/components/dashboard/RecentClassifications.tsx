'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SkeletonCard from '@/components/common/SkeletonCard';
import {
    FileText,
    Clock,
    CheckCircle,
    AlertCircle,
    Download,
    Eye,
    Trash2,
    Calendar,
    FolderOpen,
} from 'lucide-react';
// Simple date formatting function
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};
import { ClassificationStatus } from '@/types/classification';
import { cn } from '@/lib/utils/cn';

interface RecentClassification {
    id: string;
    status: ClassificationStatus;
    totalDocuments: number;
    totalSize: number;
    createdAt: string;
    processedAt?: string;
    validatedAt?: string;
    downloadedAt?: string;
    expiresAt?: string;
}

interface RecentClassificationsProps {
    classifications?: RecentClassification[];
    loading?: boolean;
    onView?: (id: string) => void;
    onDownload?: (id: string) => void;
    onDelete?: (id: string) => void;
    maxItems?: number;
    className?: string;
}

const statusConfig = {
    [ClassificationStatus.PROCESSING]: {
        label: 'Processing',
        icon: Clock,
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        iconColor: 'text-yellow-600',
    },
    [ClassificationStatus.READY]: {
        label: 'Ready',
        icon: CheckCircle,
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        iconColor: 'text-blue-600',
    },
    [ClassificationStatus.VALIDATED]: {
        label: 'Validated',
        icon: CheckCircle,
        color: 'bg-green-100 text-green-800 border-green-200',
        iconColor: 'text-green-600',
    },
    [ClassificationStatus.DOWNLOADED]: {
        label: 'Downloaded',
        icon: Download,
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        iconColor: 'text-purple-600',
    },
    [ClassificationStatus.EXPIRED]: {
        label: 'Expired',
        icon: AlertCircle,
        color: 'bg-red-100 text-red-800 border-red-200',
        iconColor: 'text-red-600',
    },
};

export default function RecentClassifications({
    classifications = [],
    loading = false,
    onView,
    onDownload,
    onDelete,
    maxItems = 5,
    className,
}: RecentClassificationsProps) {
    const displayClassifications = classifications.slice(0, maxItems);

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    if (loading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Recent Classifications
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {Array.from({ length: maxItems }).map((_, index) => (
                        <SkeletonCard key={index} className="h-20" />
                    ))}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Recent Classifications
                </CardTitle>
            </CardHeader>
            <CardContent>
                {displayClassifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No classifications yet</p>
                        <p className="text-sm">Upload some documents to get started</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {displayClassifications.map((classification) => {
                            const statusInfo = statusConfig[classification.status];
                            const StatusIcon = statusInfo.icon;

                            return (
                                <div
                                    key={classification.id}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge
                                                variant="outline"
                                                className={cn('text-xs', statusInfo.color)}
                                            >
                                                <StatusIcon className="w-3 h-3 mr-1" />
                                                {statusInfo.label}
                                            </Badge>
                                            <span className="text-sm text-gray-600">
                                                {classification.totalDocuments} documents
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(classification.createdAt)}
                                            </span>
                                            <span>
                                                {formatFileSize(classification.totalSize)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 ml-3">
                                        {onView && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onView(classification.id)}
                                                className="h-8 w-8 p-0"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        )}
                                        {onDownload &&
                                            [ClassificationStatus.VALIDATED, ClassificationStatus.DOWNLOADED].includes(
                                                classification.status
                                            ) && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onDownload(classification.id)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                            )}
                                        {onDelete && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onDelete(classification.id)}
                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}