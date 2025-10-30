'use client';

import React, { useState } from 'react';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { DropZone } from '@/components/upload/DropZone';
import { FileList } from '@/components/upload/FileList';
import { ProfileSelector } from '@/components/upload/ProfileSelector';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useUpload } from '@/hooks/useUpload';
import { Profile } from '@/types/category';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function HomePage() {
    const [selectedProfile, setSelectedProfile] = useState<Profile | undefined>(undefined);

    const {
        files,
        addFiles,
        removeFile,
        clearFiles,
        uploadFiles,
        isUploading,
        error,
        totalSize,
        fileCount,
        canUpload,
    } = useUpload({
        profile: selectedProfile,
        language: 'fr',
    });

    return (
        <div className="min-h-screen flex flex-col">
            <Header showLanguageSwitch />

            <main className="flex-1 container mx-auto px-4 py-12">
                {/* Hero Section */}
                <div className="text-center mb-12 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-light text-primary text-sm font-medium mb-4">
                        <Sparkles className="h-4 w-4" />
                        Classification intelligente propulsée par IA
                    </div>
                    <h1 className="text-5xl font-bold text-foreground mb-4">
                        Classifiez vos documents
                        <br />
                        <span className="text-primary">en quelques secondes</span>
                    </h1>
                    <p className="text-xl text-foreground-muted max-w-2xl mx-auto">
                        Uploadez vos fichiers, laissez notre IA les organiser automatiquement
                        par catégories, puis téléchargez-les structurés.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
                    <Card className="p-6 text-center">
                        <p className="text-3xl font-bold text-primary mb-1">100</p>
                        <p className="text-sm text-foreground-muted">fichiers max</p>
                    </Card>
                    <Card className="p-6 text-center">
                        <p className="text-3xl font-bold text-primary mb-1">200 MB</p>
                        <p className="text-sm text-foreground-muted">taille totale</p>
                    </Card>
                    <Card className="p-6 text-center">
                        <p className="text-3xl font-bold text-primary mb-1">2h</p>
                        <p className="text-sm text-foreground-muted">session active</p>
                    </Card>
                </div>

                {/* Profile Selector */}
                <div className="max-w-5xl mx-auto mb-8">
                    <ProfileSelector
                        selected={selectedProfile}
                        onSelect={setSelectedProfile}
                    />
                </div>

                {/* Upload Section */}
                <div className="max-w-4xl mx-auto space-y-6">
                    <DropZone
                        onFilesAdded={addFiles}
                        disabled={isUploading}
                    />

                    {error && (
                        <Card className="p-4 border-error bg-error-light">
                            <p className="text-error font-medium">{error}</p>
                        </Card>
                    )}

                    {fileCount > 0 && (
                        <>
                            <FileList
                                files={files}
                                onRemove={removeFile}
                                disabled={isUploading}
                            />

                            <div className="flex items-center justify-between gap-4">
                                <Button
                                    variant="outline"
                                    onClick={clearFiles}
                                    disabled={isUploading}
                                >
                                    Tout effacer
                                </Button>

                                <Button
                                    onClick={uploadFiles}
                                    disabled={!canUpload}
                                    size="lg"
                                    className="gap-2"
                                >
                                    {isUploading ? (
                                        <>
                                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Upload en cours...
                                        </>
                                    ) : (
                                        <>
                                            Lancer l'analyse
                                            <ArrowRight className="h-5 w-5" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </div>

                {/* Features */}
                <div className="max-w-5xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🚀</span>
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">Rapide</h3>
                        <p className="text-sm text-foreground-muted">
                            Classification instantanée de centaines de documents en quelques secondes
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="w-12 h-12 bg-success-light rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🔒</span>
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">Sécurisé</h3>
                        <p className="text-sm text-foreground-muted">
                            Vos fichiers sont automatiquement supprimés après 2 heures
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="w-12 h-12 bg-warning-light rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🎯</span>
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">Intelligent</h3>
                        <p className="text-sm text-foreground-muted">
                            IA entraînée pour reconnaître automatiquement le type de vos documents
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}