import { FileX } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface EmptyStateProps {
    title?: string;
    description?: string;
    className?: string;
}

export default function EmptyState({
    title = 'No Data Available',
    description = 'There is nothing to show here.',
    className,
}: EmptyStateProps) {
    return (
        <div className={cn('glass-card p-8 text-center', className)}>
            <FileX className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </div>
    );
}