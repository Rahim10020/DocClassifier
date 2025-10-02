import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ConfidenceIndicatorProps {
    confidence: number;
    size?: 'small' | 'large';
}

export default function ConfidenceIndicator({ confidence, size = 'small' }: ConfidenceIndicatorProps) {
    let colorClass = '';
    let label = '';
    let Icon;

    if (confidence > 0.8) {
        colorClass = 'bg-green-500 text-white';
        label = 'Haute confiance';
        Icon = CheckCircle;
    } else if (confidence >= 0.6) {
        colorClass = 'bg-orange-500 text-white';
        label = 'Moyenne';
        Icon = AlertCircle;
    } else {
        colorClass = 'bg-red-500 text-white';
        label = 'Faible';
        Icon = XCircle;
    }

    const sizeClass = size === 'large' ? 'p-3 text-lg' : 'p-1 text-sm';

    return (
        <div className={cn('inline-flex items-center rounded-full', colorClass, sizeClass)}>
            <Icon className="w-4 h-4 mr-1" />
            {label} ({(confidence * 100).toFixed(0)}%)
        </div>
    );
}