import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: number; // Positive or negative
}

export default function StatsCard({ title, value, icon: Icon, trend }: StatsCardProps) {

    return (
        <Card className="bg-gradient-to-br from-primary to-secondary text-white">
            <CardContent className="p-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">{title}</h3>
                    {Icon && <Icon className="w-5 h-5" />}
                </div>
                <p className="text-2xl font-bold">{value}</p>
                {trend !== undefined && (
                    <div className={cn('flex items-center text-xs', trend > 0 ? 'text-green-300' : 'text-red-300')}>
                        {trend > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </CardContent>
        </Card>
    );
}