'use client';

import React from 'react';
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
        icon: <GraduationCap className="h-7 w-7" />,
        description: 'Pour organiser vos documents académiques',
        descriptionEn: 'To organize your academic documents',
    },
    {
        id: 'professional',
        name: 'Professionnel',
        nameEn: 'Professional',
        icon: <Briefcase className="h-7 w-7" />,
        description: 'Pour vos documents professionnels et d\'entreprise',
        descriptionEn: 'For your professional and business documents',
    },
    {
        id: 'researcher',
        name: 'Chercheur',
        nameEn: 'Researcher',
        icon: <Microscope className="h-7 w-7" />,
        description: 'Pour la recherche scientifique et académique',
        descriptionEn: 'For scientific and academic research',
    },
    {
        id: 'personal',
        name: 'Personnel',
        nameEn: 'Personal',
        icon: <User className="h-7 w-7" />,
        description: 'Pour vos documents personnels et familiaux',
        descriptionEn: 'For your personal and family documents',
    },
    {
        id: 'auto',
        name: 'Auto',
        nameEn: 'Auto',
        icon: <Zap className="h-7 w-7" />,
        description: 'Laissez le système décider automatiquement',
        descriptionEn: 'Let the system decide automatically',
    },
];

export function ProfileSelector({ selected, onSelect, className }: ProfileSelectorProps) {
    return (
        <div className={cn('space-y-6', className)}>
            <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-3">
                    Sélectionnez votre profil
                </h2>
                <p className="text-sm text-foreground-muted">
                    Cela aide à mieux classifier vos documents selon votre contexte
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {PROFILES.map((profile) => (
                    <Card
                        key={profile.id}
                        hover
                        className={cn(
                            'p-6 cursor-pointer transition-all duration-300',
                            'shadow-sm hover:shadow-lg',
                            selected === profile.id && 'ring-2 ring-primary bg-primary-light shadow-lg scale-105'
                        )}
                        onClick={() => onSelect(profile.id)}
                    >
                        <div className="flex flex-col items-center text-center gap-4">
                            <div
                                className={cn(
                                    'p-4 rounded-2xl transition-all duration-300',
                                    selected === profile.id
                                        ? 'bg-primary text-white shadow-md scale-110'
                                        : 'bg-background-secondary text-foreground-muted'
                                )}
                            >
                                {profile.icon}
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground mb-2 text-base">
                                    {profile.name}
                                </h3>
                                <p className="text-xs text-foreground-muted leading-relaxed">
                                    {profile.description}
                                </p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {selected && (
                <div className="text-center text-sm text-primary font-medium animate-fade-in bg-primary-light px-6 py-3 rounded-xl shadow-sm">
                    ✓ Profil sélectionné: <span className="font-semibold">{PROFILES.find(p => p.id === selected)?.name}</span>
                </div>
            )}
        </div>
    );
}