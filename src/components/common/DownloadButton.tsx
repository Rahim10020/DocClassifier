'use client';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useDownload } from '@/hooks/useDownload';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils/cn';

interface DownloadButtonProps {
    classificationId: string;
    disabled?: boolean;
    onComplete?: () => void;
}

export default function DownloadButton({
    classificationId,
    disabled = false,
    onComplete,
}: DownloadButtonProps) {
    const { downloading, progress, error, downloadZip } = useDownload();
    const { toast } = useToast();

    const handleDownload = async () => {
        try {
            await downloadZip(classificationId);
            toast({ title: 'Téléchargé', description: 'ZIP téléchargé avec succès.' });
            onComplete?.();
        } catch {
            toast({ title: 'Erreur', description: error || 'Téléchargement échoué', variant: 'destructive' });
        }
    };

    return (
        <Button
            className={cn('bg-gradient-to-r from-primary to-secondary', downloading && 'animate-pulse')}
            disabled={disabled || downloading}
            onClick={handleDownload}
        >
            <Download className="w-4 h-4 mr-2" />
            {downloading ? 'Téléchargement...' : 'Télécharger ZIP'}
            {downloading && <Progress value={progress} className="ml-2 w-20" />}
        </Button>
    );
}