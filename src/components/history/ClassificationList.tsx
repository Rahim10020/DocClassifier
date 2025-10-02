import ClassificationCard from './ClassificationCard';
import { Skeleton } from '../../components/ui/skeleton';
import type { Classification } from '@/types/classification';

interface ClassificationListProps {
    classifications: Classification[];
    loading?: boolean;
}

export default function ClassificationList({ classifications, loading = false }: ClassificationListProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-40 rounded-lg" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classifications.map((classification) => (
                <ClassificationCard key={classification.id} classification={classification} />
            ))}
        </div>
    );
}