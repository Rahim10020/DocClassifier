'use client';

import { useState } from 'react';
import { useUpload, UploadProvider } from '@/hooks/useUpload';
import DropZone from '@/components/upload/DropZone';
import FileList from '@/components/upload/FileList';
import UploadProgress from '@/components/upload/UploadProgress';
import UploadSummary from '@/components/upload/UploadSummary';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { File, FolderOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

function UploadPageInner() {
    const { files, uploading, progress, uploadFiles, clearFiles, isValid } = useUpload();
    const router = useRouter();
    const [classificationId, setClassificationId] = useState<string | null>(null);
    const [classificationStage, setClassificationStage] = useState<'uploading' | 'classifying'>('uploading');

    const handleStartClassification = async () => {
        setClassificationStage('uploading');
        const result = await uploadFiles();
        if (result?.data?.classificationId) {
            setClassificationId(result.data.classificationId);
            setClassificationStage('classifying');
            // Wait a moment for processing to start, then redirect
            setTimeout(() => {
                router.push(`/review/${result.data!.classificationId}`);
            }, 1000);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold animate-fade-in">Upload Documents</h1>
                    <p className="text-muted-foreground mt-2">Drag and drop your files or click to select</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-6">
                    <DropZone />
                </Card>

                <div className="space-y-6">
                    <FileList />
                    {uploading && <UploadProgress progress={progress} stage={classificationStage} />}
                    {files.length > 0 && !uploading && (
                        <UploadSummary
                            fileCount={files.length}
                            totalSize={files.reduce((sum, file) => sum + file.fileSize, 0)}
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

export default function UploadPage() {
    return (
        <UploadProvider>
            <UploadPageInner />
        </UploadProvider>
    );
}