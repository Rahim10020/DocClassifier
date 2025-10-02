import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface MergeDialogProps {
    open: boolean;
    onClose: () => void;
    onMerge: (sourceId: string, targetId: string) => void;
    categories: { id: string; name: string }[];
}

export default function MergeDialog({ open, onClose, onMerge, categories }: MergeDialogProps) {
    const [sourceId, setSourceId] = useState<string>('');
    const [targetId, setTargetId] = useState<string>('');

    const handleMerge = () => {
        if (sourceId && targetId && sourceId !== targetId) {
            onMerge(sourceId, targetId);
            onClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Fusionner catégories</DialogTitle>
                    <DialogDescription>
                        Tous les documents de la source seront déplacés vers la cible. La source sera supprimée.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <Select value={sourceId} onValueChange={setSourceId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Source" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={targetId} onValueChange={setTargetId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Cible" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Annuler
                    </Button>
                    <Button onClick={handleMerge}>Fusionner</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}