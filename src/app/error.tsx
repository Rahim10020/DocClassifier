'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ErrorProps {
    error: Error;
    reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex items-center justify-center h-screen bg-background">
            <div className="bg-background/80 backdrop-blur-md p-8 rounded-lg shadow-lg border max-w-md text-center">
                <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">An error has occurred</h1>
                <p className="text-muted-foreground mb-4">Please try again or contact support if the problem persists.</p>
                <Button onClick={reset} className="bg-primary">
                    Try again
                </Button>
            </div>
        </div>
    );
}