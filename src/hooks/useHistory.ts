import { useState, useEffect, useCallback } from 'react';

interface UseHistoryProps<T> {
    initialState: T;
}

export function useHistory<T>({ initialState }: UseHistoryProps<T>) {
    const [history, setHistory] = useState<T[]>([initialState]);
    const [index, setIndex] = useState(0);

    const push = useCallback((newState: T) => {
        setHistory((prev) => [...prev.slice(0, index + 1), newState]);
        setIndex((prev) => prev + 1);
    }, [index]);

    const undo = useCallback(() => {
        if (index > 0) {
            setIndex((prev) => prev - 1);
        }
    }, [index]);

    const redo = useCallback(() => {
        if (index < history.length - 1) {
            setIndex((prev) => prev + 1);
        }
    }, [index, history.length]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'z') {
                undo();
            } else if (e.ctrlKey && e.key === 'y') {
                redo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    return {
        current: history[index],
        push,
        undo,
        redo,
        canUndo: index > 0,
        canRedo: index < history.length - 1,
    };
}