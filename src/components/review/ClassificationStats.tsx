import { Progress } from '@/components/ui/progress';

interface ClassificationStatsProps {
    totalDocs: number;
    categoryCount: number;
    avgConfidence: number;
    breakdown: { high: number; medium: number; low: number };
}

export default function ClassificationStats({
    totalDocs,
    categoryCount,
    avgConfidence,
    breakdown,
}: ClassificationStatsProps) {
    return (
        <div className="bg-background/80 backdrop-blur-md p-4 rounded-lg shadow-lg border flex space-x-4"> {/* Glassmorphism */}
            <div>
                <p className="font-bold">Documents: {totalDocs}</p>
                <p>Catégories: {categoryCount}</p>
                <p>Confiance moyenne: {(avgConfidence * 100).toFixed(0)}%</p>
            </div>
            <div>
                <p>Haut: {breakdown.high}</p>
                <p>Moyen: {breakdown.medium}</p>
                <p>Bas: {breakdown.low}</p>
            </div>
            <Progress value={avgConfidence * 100} className="w-32" />
        </div>
    );
}