'use client';

import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function SearchBar({
    value,
    onChange,
    placeholder = 'Rechercher un document...',
    className,
}: SearchBarProps) {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    useEffect(() => {
        const timer = setTimeout(() => {
            onChange(localValue);
        }, 300);

        return () => clearTimeout(timer);
    }, [localValue, onChange]);

    const handleClear = () => {
        setLocalValue('');
        onChange('');
    };

    return (
        <div className={cn('relative', className)}>
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />

                <input
                    type="text"
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    placeholder={placeholder}
                    className={cn(
                        'w-full pl-12 pr-12 py-3.5 rounded-xl',
                        'bg-background-secondary shadow-sm',
                        'text-foreground placeholder:text-foreground-muted',
                        'focus:outline-none focus:ring-2 focus:ring-primary focus:shadow-md',
                        'transition-all duration-200'
                    )}
                />

                {localValue && (
                    <button
                        onClick={handleClear}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors p-1 hover:bg-background-tertiary rounded-lg"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {localValue && (
                <div className="absolute top-full left-0 right-0 mt-2 text-xs text-foreground-muted animate-fade-in">
                    Recherche: <span className="font-medium">&quot;{localValue}&quot;</span>
                </div>
            )}
        </div>
    );
}