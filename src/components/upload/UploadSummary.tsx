import { Button } from '@/components/ui/button';
import { File, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatBytes } from '@/lib/utils/formatters';

interface UploadSummaryProps {
    fileCount: number;
    totalSize: number;
    onClear: () => void;
}

export default function UploadSummary({ fileCount, totalSize, onClear }: UploadSummaryProps) {
    return (
        <div className="glass-card p-4 space-y-3">
            <div className="flex items-center space-x-2">
                <File className="h-5 w-5 text-primary" />
                <span className="font-semibold">Ready to upload</span>
            </div>
            <div className="grid grid-cols-2 text-sm text-muted-foreground">
                <span>{fileCount} files</span>
                <span>{formatBytes(totalSize)}</span>
            </div>
            <Button variant="outline" size="sm" onClick={onClear} className="w-full">
                Clear Selection
            </Button>
        </div>
    );
}