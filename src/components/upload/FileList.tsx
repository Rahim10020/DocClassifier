'use client';

import { useUpload } from '@/hooks/useUpload';
import FileItem from './FileItem';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function FileList() {
    const { files, removeFile, clearFiles } = useUpload();

    if (files.length === 0) return null;

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Selected Files ({files.length})</h3>
                <div className="text-sm text-muted-foreground">
                    Total: {files.reduce((sum, file) => sum + file.size, 0)} bytes
                </div>
                <Button variant="ghost" size="sm" onClick={clearFiles}>
                    <X className="h-4 w-4" />
                    Clear All
                </Button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
                {files.map((file, index) => (
                    <FileItem key={file.name + index} file={file} index={index} onRemove={removeFile} />
                ))}
            </div>
        </div>
    );
}