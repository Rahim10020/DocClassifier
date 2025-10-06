import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils/cn';

interface UploadProgressProps {
    progress: number;
    stage?: 'uploading' | 'classifying';
}

export default function UploadProgress({ progress, stage = 'uploading' }: UploadProgressProps) {
    const getStageText = () => {
        switch (stage) {
            case 'uploading':
                return 'Upload Progress';
            case 'classifying':
                return 'Classification Progress';
            default:
                return 'Progress';
        }
    };

    return (
        <div className="glass-card p-4">
            <div className="flex justify-between text-sm mb-2">
                <span>{getStageText()}</span>
                <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            {stage === 'classifying' && (
                <p className="text-xs text-muted-foreground mt-2">
                    Analyzing documents and organizing into categories...
                </p>
            )}
        </div>
    );
}