'use client';

import { FileText, FileSpreadsheet, File, Loader2, XCircle, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { formatBytes } from '@/lib/utils/formatters';
import { getFileIcon } from '@/lib/utils/formatters';
import { UploadedFile } from '@/types/document';

interface FileItemProps {
    file: UploadedFile;
    index: number;
    onRemove: (index: number) => void;
}

export default function FileItem({ file, index, onRemove }: FileItemProps) {
    const Icon = getFileIcon(file.mimeType);
    const status = file.status || 'pending';

    return (
        <div className="glass-card p-3 flex items-center space-x-3">
            <Icon className="h-6 w-6 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{file.originalName}</p>
                <p className="text-sm text-muted-foreground">{formatBytes(file.fileSize)}</p>
            </div>
            {status === 'uploading' && (
                <div className="w-16">
                    <Progress value={file.progress || 0} className="h-2" />
                </div>
            )}
            <div className="flex items-center space-x-2">
                {status === 'error' && <XCircle className="h-4 w-4 text-destructive" />}
                {status === 'uploading' && <Loader2 className="h-4 w-4 animate-spin" />}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(index)}
                    disabled={status === 'uploading'}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}