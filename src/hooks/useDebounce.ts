import { useState, useEffect } from 'react';

/**
 * Custom hook that debounces a value
 * Useful for search inputs, API calls, etc.
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Set up a timer to update the debounced value after the delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Clean up the timer if value changes before delay completes
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Custom hook that debounces a callback function
 * Useful for API calls that should not be triggered on every keystroke
 */
export function useDebounceCallback<T extends (...args: any[]) => any>(
    callback: T,
    delay: number
): T {
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

    const debouncedCallback = ((...args: Parameters<T>) => {
        // Clear existing timer
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        // Set new timer
        const newTimer = setTimeout(() => {
            callback(...args);
        }, delay);

        setDebounceTimer(newTimer);
    }) as T;

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
        };
    }, [debounceTimer]);

    return debouncedCallback;
}

/**
 * Custom hook for debounced search functionality
 */
export function useDebounceSearch(
    initialValue: string = '',
    delay: number = 300
): {
    searchTerm: string;
    debouncedSearchTerm: string;
    setSearchTerm: (value: string) => void;
    isSearching: boolean;
} {
    const [searchTerm, setSearchTerm] = useState(initialValue);
    const [isSearching, setIsSearching] = useState(false);
    const debouncedSearchTerm = useDebounce(searchTerm, delay);

    useEffect(() => {
        if (debouncedSearchTerm !== searchTerm) {
            setIsSearching(true);
        } else {
            setIsSearching(false);
        }
    }, [debouncedSearchTerm, searchTerm]);

    return {
        searchTerm,
        debouncedSearchTerm,
        setSearchTerm,
        isSearching,
    };
}