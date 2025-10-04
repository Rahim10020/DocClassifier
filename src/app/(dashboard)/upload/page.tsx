'use client';

import { useUpload } from '@/hooks/useUpload';
import DropZone from '@/components/upload/DropZone';
import FileList from '@/components/upload/FileList';
import UploadProgress from '@/components/upload/UploadProgress';
import UploadSummary from '@/components/upload/UploadSummary';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { File, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
    const { files, uploading, progress, uploadFiles, clearFiles, isValid } = useUpload();
    const router = useRouter();

    const handleStartClassification = async () => {
        const result = await uploadFiles();
        if (result?.classificationId) {
            router.push(`/review/${result.classificationId}`);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold animate-fade-in">Upload Documents</h1>
                    <p className="text-muted-foreground mt-2">Drag and drop your files or click to select</p>
                </div>
                <Link href="/profile">
                    <Button variant="outline">
                        <FolderOpen className="mr-2 h-4 w-4" />
                        Back to Profile
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-6">
                    <DropZone />
                </Card>

                <div className="space-y-6">
                    <FileList />
                    {uploading && <UploadProgress progress={progress} />}
                    {files.length > 0 && !uploading && (
                        <UploadSummary
                            fileCount={files.length}
                            totalSize={files.reduce((sum, file) => sum + file.size, 0)}
                            onClear={clearFiles}
                        />
                    )}
                    {files.length > 0 && !uploading && isValid && (
                        <Button onClick={handleStartClassification} className="w-full" size="lg">
                            <File className="mr-2 h-4 w-4" />
                            Start Classification
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}