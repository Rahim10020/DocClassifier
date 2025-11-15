'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const cycleTheme = () => {
        if (theme === 'light') setTheme('dark');
        else if (theme === 'dark') setTheme('system');
        else setTheme('light');
    };

    const getIcon = () => {
        if (theme === 'light') return <Sun className="h-5 w-5" />;
        if (theme === 'dark') return <Moon className="h-5 w-5" />;
        return <Monitor className="h-5 w-5" />;
    };

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={cycleTheme}
            className="rounded-full"
            title={`Theme: ${theme}`}
        >
            {getIcon()}
        </Button>
    );
}
