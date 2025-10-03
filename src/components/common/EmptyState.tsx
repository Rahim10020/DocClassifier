import { FileX, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
    title?: string;
    description?: string;
    className?: string;
    icon?: 'file' | 'search' | 'plus';
    action?: {
        label: string;
        onClick: () => void;
    };
}

export default function EmptyState({
    title = 'Aucune donnée disponible',
    description = 'Il n\'y a rien à afficher ici.',
    className,
    icon = 'file',
    action,
}: EmptyStateProps) {
    const icons = {
        file: FileX,
        search: Search,
        plus: Plus,
    };

    const Icon = icons[icon];

    return (
        <div className={cn('glass-card p-12 text-center animate-fade-in', className)}>
            <div className="mx-auto w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mb-6">
                <Icon className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-3">{title}</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                {description}
            </p>
            {action && (
                <Button onClick={action.onClick} className="hover-scale">
                    {action.label}
                </Button>
            )}
        </div>
    );
}