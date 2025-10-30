'use client';

import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

export function LanguageSwitch() {
    const [language, setLanguage] = useState<'fr' | 'en'>('fr');
    const [open, setOpen] = useState(false);

    const handleLanguageChange = (lang: 'fr' | 'en') => {
        setLanguage(lang);
        setOpen(false);
        // TODO: Implémenter le changement de langue global
        console.log('Language changed to:', lang);
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen} trigger={
            <Button variant="ghost" size="icon">
                <Globe className="h-5 w-5" />
                <span className="sr-only">Changer de langue</span>
            </Button>
        }>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleLanguageChange('fr')}>
                    <div className="flex items-center gap-2">
                        <span className="text-lg">🇫🇷</span>
                        <span>Français</span>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange('en')}>
                    <div className="flex items-center gap-2">
                        <span className="text-lg">🇬🇧</span>
                        <span>English</span>
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}