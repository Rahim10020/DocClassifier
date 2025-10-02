'use client';

import { useTimer } from '@/hooks/useTimer';
import { cn } from '@/lib/utils/cn';

interface ExpirationTimerProps {
    expiresAt: Date;
}

export default function ExpirationTimer({ expiresAt }: ExpirationTimerProps) {
    const { formatted, isWarning, isDanger } = useTimer(expiresAt);

    return (
        <div
            className={cn(
                'p-2 rounded font-mono',
                isDanger ? 'bg-red-500 text-white' : isWarning ? 'bg-orange-500 text-white' : 'bg-muted'
            )}
        >
            Temps restant: {formatted}
        </div>
    );
}