import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { z } from 'zod';

const schema = z.object({
    name: z.string().min(1, 'Nom requis'),
    parentId: z.string().optional(),
});

interface CategoryEditorProps {
    open: boolean;
    onClose: () => void;
    onSave: (name: string, parentId?: string) => void;
    initialName?: string;
    parentOptions: { id: string; name: string }[];
    title: string;
}

export default function CategoryEditor({
    open,
    onClose,
    onSave,
    initialName = '',
    parentOptions,
    title,
}: CategoryEditorProps) {
    const [name, setName] = useState(initialName);
    const [parentId, setParentId] = useState<string | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);

    const handleSave = () => {
        try {
            const data = schema.parse({ name, parentId });
            onSave(data.name, data.parentId);
            onClose();
        } catch (err) {
            setError((err as z.ZodError).errors[0].message);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nom de la catégorie"
                    />
                    <Select value={parentId} onValueChange={setParentId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Parent (optionnel)" />
                        </SelectTrigger>
                        <SelectContent>
                            {parentOptions.map((opt) => (
                                <SelectItem key={opt.id} value={opt.id}>
                                    {opt.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {error && <p className="text-red-500">{error}</p>}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Annuler
                    </Button>
                    <Button onClick={handleSave}>Sauvegarder</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}