import { Skeleton } from '../../../components/ui/skeleton';
import { cn } from '@/lib/utils/cn';

interface SkeletonCardProps {
    className?: string;
}

export default function SkeletonCard({ className }: SkeletonCardProps) {
    return (
        <div className={cn('p-4 border rounded-lg space-y-2', className)}>
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
        </div>
    );
}