'use client';

import React from 'react';
import { FolderTree, ListTree, FileText, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExportOptions as ExportOptionsType } from '@/types/session';
import { cn } from '@/lib/utils';

interface ExportOptionsProps {
    options: ExportOptionsType;
    onChange: (options: ExportOptionsType) => void;
    onShowPreview: () => void;
}

export function ExportOptions({ options, onChange, onShowPreview }: ExportOptionsProps) {
    return (
        <div className="space-y-4">
            {/* Structure Selection */}
            <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                    Structure de l'archive
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <Card
                        className={cn(
                            'p-4 cursor-pointer transition-all hover:shadow-md',
                            options.structure === 'hierarchical' && 'border-primary bg-primary-light ring-2 ring-primary'
                        )}
                        onClick={() => onChange({ ...options, structure: 'hierarchical' })}
                    >
                        <div className="flex flex-col items-center text-center gap-3">
                            <div
                                className={cn(
                                    'p-3 rounded-full',
                                    options.structure === 'hierarchical'
                                        ? 'bg-primary text-white'
                                        : 'bg-background-secondary text-foreground-muted'
                                )}
                            >
                                <FolderTree className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground mb-1">
                                    Hiérarchique
                                </h4>
                                <p className="text-xs text-foreground-muted">
                                    Dossiers organisés par catégories
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card
                        className={cn(
                            'p-4 cursor-pointer transition-all hover:shadow-md',
                            options.structure === 'flat' && 'border-primary bg-primary-light ring-2 ring-primary'
                        )}
                        onClick={() => onChange({ ...options, structure: 'flat' })}
                    >
                        <div className="flex flex-col items-center text-center gap-3">
                            <div
                                className={cn(
                                    'p-3 rounded-full',
                                    options.structure === 'flat'
                                        ? 'bg-primary text-white'
                                        : 'bg-background-secondary text-foreground-muted'
                                )}
                            >
                                <ListTree className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground mb-1">
                                    Plate
                                </h4>
                                <p className="text-xs text-foreground-muted">
                                    Tous les fichiers au même niveau
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Additional Options */}
            <Card className="p-4">
                <h4 className="font-medium text-foreground mb-3">Options supplémentaires</h4>

                <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={options.includeReadme}
                            onChange={(e) => onChange({ ...options, includeReadme: e.target.checked })}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                        />
                        <div className="flex items-center gap-2 flex-1">
                            <FileText className="h-4 w-4 text-foreground-muted" />
                            <div>
                                <p className="text-sm font-medium text-foreground">
                                    Inclure un fichier README.txt
                                </p>
                                <p className="text-xs text-foreground-muted">
                                    Liste détaillée de tous les documents classifiés
                                </p>
                            </div>
                        </div>
                    </label>
                </div>
            </Card>

            {/* Preview Button */}
            <Button
                variant="outline"
                onClick={onShowPreview}
                className="w-full gap-2"
            >
                <Eye className="h-4 w-4" />
                Aperçu de la structure
            </Button>

            {/* Info Box */}
            <div className="p-3 rounded-lg bg-background-secondary border border-border">
                <p className="text-sm text-foreground-muted">
                    <strong>Note:</strong> Vos documents seront téléchargés dans un fichier ZIP.
                    La session sera automatiquement supprimée après le téléchargement.
                </p>
            </div>
        </div>
    );
}