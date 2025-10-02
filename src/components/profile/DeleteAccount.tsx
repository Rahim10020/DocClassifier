'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

interface DeleteAccountProps {
    userEmail: string;
}

export default function DeleteAccount({ userEmail }: DeleteAccountProps) {
    const [open, setOpen] = useState(false);
    const [confirmEmail, setConfirmEmail] = useState('');
    const { toast } = useToast();
    const router = useRouter();

    const handleDelete = async () => {
        if (confirmEmail !== userEmail) {
            toast({ title: 'Erreur', description: 'Email ne correspond pas', variant: 'destructive' });
            return;
        }

        try {
            const res = await fetch('/api/user/delete', { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            toast({ title: 'Succès', description: 'Compte supprimé' });
            router.push('/'); // Logout and redirect
        } catch (err) {
            toast({ title: 'Erreur', description: 'Suppression échouée', variant: 'destructive' });
        }
    };

    return (
        <div>
            <Button variant="destructive" onClick={() => setOpen(true)}>
                Supprimer mon compte
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmer la suppression</DialogTitle>
                        <DialogDescription>
                            Cette action est irréversible. Entrez votre email pour confirmer.
                        </DialogDescription>
                    </DialogHeader>
                    <Input value={confirmEmail} onChange={(e) => setConfirmEmail(e.target.value)} placeholder="Votre email" />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                        <Button variant="destructive" onClick={handleDelete}>Supprimer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}