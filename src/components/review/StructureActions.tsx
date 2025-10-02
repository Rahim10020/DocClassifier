'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import DownloadButton from '@/components/common/DownloadButton';

interface StructureActionsProps {
    classificationId: string;
}

export default function StructureActions({ classificationId }: StructureActionsProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [isValidated, setIsValidated] = useState(false);

    const handleCancel = () => router.back();
    const handleSaveDraft = () => { /* API call */ };

    const handleValidate = async () => {
        try {
            const res = await fetch(`/api/classification/${classificationId}/validate`, { method: 'POST' });
            if (!res.ok) throw new Error('Validation failed');
            const { success, downloadUrl } = await res.json();
            if (success) {
                setIsValidated(true);
                toast({ title: 'Validé', description: 'Classification validée. Téléchargez maintenant.' });
            }
        } catch (err) {
            toast({ title: 'Erreur', description: 'Validation échouée', variant: 'destructive' });
        }
    };

    return (
        <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancel}>
                Annuler
            </Button>
            <Button variant="outline" onClick={handleSaveDraft}>
                Sauvegarder brouillon
            </Button>
            {!isValidated ? (
                <Button className="bg-gradient-to-r from-primary to-secondary" onClick={handleValidate}>
                    Valider
                </Button>
            ) : (
                <DownloadButton classificationId={classificationId} />
            )}
        </div>
    );
}