import { useState, useEffect } from 'react';

interface UseTimerReturn {
    timeLeft: number;
    formatted: string;
    isExpired: boolean;
    isWarning: boolean;
    isDanger: boolean;
}

export function useTimer(expiresAt: Date): UseTimerReturn {
    const [timeLeft, setTimeLeft] = useState(() => (expiresAt.getTime() - Date.now()) / 1000);

    useEffect(() => {
        const interval = setInterval(() => {
            const remaining = (expiresAt.getTime() - Date.now()) / 1000;
            setTimeLeft(remaining);
            if (remaining <= 0) clearInterval(interval);
        }, 1000);

        return () => clearInterval(interval);
    }, [expiresAt]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = Math.floor(timeLeft % 60);
    const formatted = `${minutes.toString().padStart(2, '0')} min ${seconds.toString().padStart(2, '0')} sec`;

    const isExpired = timeLeft <= 0;
    const isWarning = timeLeft < 5 * 60 && timeLeft >= 2 * 60;
    const isDanger = timeLeft < 2 * 60 && !isExpired;

    return { timeLeft, formatted, isExpired, isWarning, isDanger };
}