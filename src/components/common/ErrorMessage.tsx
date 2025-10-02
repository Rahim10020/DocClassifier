import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface ErrorMessageProps {
    error: string;
    onRetry?: () => void;
    className?: string;
}

export default function ErrorMessage({ error, onRetry, className }: ErrorMessageProps) {
    return (
        <div className={cn('flex items-center p-4 border border-red-500 bg-red-50 rounded-md', className)}>
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700 flex-1">{error}</p>
            {onRetry && (
                <Button variant="outline" onClick={onRetry} className="ml-2">
                    Réessayer
                </Button>
            )}
        </div>
    );
}