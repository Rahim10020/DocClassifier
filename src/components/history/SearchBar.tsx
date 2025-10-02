'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchBarProps {
    initialSearch?: string;
}

export default function SearchBar({ initialSearch }: SearchBarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState(initialSearch || '');
    const debouncedSearch = useDebounce(search, 500);

    useEffect(() => {
        if (debouncedSearch !== initialSearch) {
            const params = new URLSearchParams(searchParams);
            if (debouncedSearch) {
                params.set('search', debouncedSearch);
            } else {
                params.delete('search');
            }
            router.push(`?${params.toString()}`);
        }
    }, [debouncedSearch, router, searchParams, initialSearch]);

    const handleClear = () => setSearch('');

    return (
        <div className="relative">
            <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par nom de fichier"
                className="pl-8"
            />
            {search && (
                <X className="absolute right-2 top-2.5 w-4 h-4 cursor-pointer" onClick={handleClear} />
            )}
        </div>
    );
}