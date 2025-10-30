'use client';

import React, { useState, useEffect } from 'react';
import { GraduationCap, Briefcase, Microscope, User, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Profile } from '@/types/category';
import { cn } from '@/lib/utils';

interface ProfileOption {
    id: Profile;
    name: string;
    nameEn: string;
    icon: React.ReactNode;
    description: string;
    descriptionEn: string;
}

interface ProfileSelectorProps {
    selected?: Profile;
    onSelect: (profile: Profile) => void;
    className?: string;
}

const PROFILES: ProfileOption[] = [
    {
        id: 'student',
        name: 'Étudiant',
        nameEn: 'Student',
        icon: <GraduationCap className="h-6 w-6" />,
        description: 'Pour organiser vos documents académiques',
        descriptionEn: 'To organize your academic documents',
    },
    {
        id: 'professional',
        name: 'Professionnel',
        nameEn: 'Professional',
        icon: <Briefcase className="h-6 w-6" />,
        description: 'Pour vos documents professionnels et d\'entreprise',
        descriptionEn: 'For your professional and business documents',
    },
    {
        id: 'researcher',
        name: 'Chercheur',
        nameEn: 'Researcher',
        icon: <Microscope className="h-6 w-6" />,
        description: 'Pour la recherche scientifique et académique',
        descriptionEn: 'For scientific and academic research',
    },
    {
        id: 'personal',
        name: 'Personnel',
        nameEn: 'Personal',
        icon: <User className="h-6 w-6" />,
        description: 'Pour vos documents personnels et familiaux',
        descriptionEn: 'For your personal and family documents',
    },
    {
        id: 'auto',
        name: 'Auto',
        nameEn: 'Auto',
        icon: <Zap className="h-6 w-6" />,
        description: 'Laissez le système décider automatiquement',
        descriptionEn: 'Let the system decide automatically',
    },
];

export function ProfileSelector({ selected, onSelect, className }: ProfileSelectorProps) {
    const [selectedProfile, setSelectedProfile] = useState<Profile | undefined>(selected);

    const handleSelect = (profile: Profile) => {
        setSelectedProfile(profile);
        onSelect(profile);
    };

    return (
        <div className={cn('space-y-4', className)}>
            <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                    Sélectionnez votre profil (optionnel)
                </h2>
                <p className="text-sm text-foreground-muted">
                    Cela aide à mieux classifier vos documents selon votre contexte
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {PROFILES.map((profile) => (
                    <Card
                        key={profile.id}
                        className={cn(
                            'p-4 cursor-pointer transition-all hover:shadow-md',
                            'hover:border-primary',
                            selectedProfile === profile.id && 'border-primary bg-primary-light ring-2 ring-primary'
                        )}
                        onClick={() => handleSelect(profile.id)}
                    >
                        <div className="flex flex-col items-center text-center gap-3">
                            <div
                                className={cn(
                                    'p-3 rounded-full transition-colors',
                                    selectedProfile === profile.id
                                        ? 'bg-primary text-white'
                                        : 'bg-background-secondary text-foreground-muted'
                                )}
                            >
                                {profile.icon}
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground mb-1">
                                    {profile.name}
                                </h3>
                                <p className="text-xs text-foreground-muted">
                                    {profile.description}
                                </p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {selectedProfile && (
                <div className="text-sm text-center text-primary">
                    ✓ Profil sélectionné: {PROFILES.find(p => p.id === selectedProfile)?.name}
                </div>
            )}
        </div>
    );
}