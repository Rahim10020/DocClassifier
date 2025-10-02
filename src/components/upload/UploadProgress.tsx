import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils/cn';

interface UploadProgressProps {
    progress: number;
}

export default function UploadProgress({ progress }: UploadProgressProps) {
    return (
        <div className="glass-card p-4">
            <div className="flex justify-between text-sm mb-2">
                <span>Upload Progress</span>
                <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
        </div>
    );
}