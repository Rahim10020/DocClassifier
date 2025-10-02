'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
// Assume DateRangePicker component

interface FilterBarProps {
    initialStatus?: string;
}

export default function FilterBar({ initialStatus }: FilterBarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState(initialStatus || 'all');
    const [dateRange, setDateRange] = useState({ from: null, to: null });

    const handleApply = () => {
        const params = new URLSearchParams(searchParams);
        params.set('status', status);
        // Set date params
        router.push(`?${params.toString()}`);
    };

    const handleReset = () => {
        setStatus('all');
        setDateRange({ from: null, to: null });
        router.push('?');
    };

    return (
        <div className="flex space-x-2">
            <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                    <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="DOWNLOADED">Téléchargés</SelectItem>
                    <SelectItem value="EXPIRED">Expirés</SelectItem>
                </SelectContent>
            </Select>
            {/* DateRangePicker */}
            <Button onClick={handleApply}>Appliquer</Button>
            <Button variant="outline" onClick={handleReset}>Réinitialiser</Button>
        </div>
    );
}