import { Card, CardContent } from '@/components/ui/card';
import { getUserStats } from '@/lib/db/queries/users';
import { formatDate } from '@/lib/utils/helpers';
// Import Recharts if needed
// import { BarChart } from 'recharts';

interface UserStatsProps {
    userId: string;
}

export default async function UserStats({ userId }: UserStatsProps) {
    const stats = await getUserStats(userId);

    return (
        <div className="space-y-4">
            <p>Total classifications: {stats.totalClassifications}</p>
            <p>Total documents traités: {stats.totalDocuments}</p>
            <p>Membre depuis: {formatDate(stats.createdAt)}</p>
            <p>Dernière activité: {formatDate(stats.lastActivity) || 'Aucune'}</p>
            {/* Charts */}
            {/* <BarChart data={stats.chartData} /> */}
        </div>
    );
}