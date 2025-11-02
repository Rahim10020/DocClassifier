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
import { ArrowRight, Sparkles, Zap, Shield, Target } from 'lucide-react';

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
        fileCount,
        canUpload,
    } = useUpload({
        profile: selectedProfile,
        language: 'fr',
    });

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header showLanguageSwitch />

            <main className="flex-1 container mx-auto px-6 py-16">
                {/* Hero Section */}
                <div className="text-center mb-16 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-light text-primary text-sm font-medium mb-6 shadow-sm">
                        <Sparkles className="h-4 w-4" />
                        Classification intelligente propulsée par IA
                    </div>
                    <h1 className="text-6xl font-bold text-foreground mb-6 leading-tight">
                        Classifiez vos documents
                        <br />
                        <span className="text-primary">en quelques secondes</span>
                    </h1>
                    <p className="text-xl text-foreground-muted max-w-2xl mx-auto leading-relaxed">
                        Uploadez vos fichiers, laissez notre IA les organiser automatiquement
                        par catégories, puis téléchargez-les structurés.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
                    <Card hover className="p-8 text-center">
                        <p className="text-4xl font-bold text-primary mb-2">50</p>
                        <p className="text-sm text-foreground-muted font-medium">fichiers max</p>
                    </Card>
                    <Card hover className="p-8 text-center">
                        <p className="text-4xl font-bold text-primary mb-2">200 MB</p>
                        <p className="text-sm text-foreground-muted font-medium">taille totale</p>
                    </Card>
                    <Card hover className="p-8 text-center">
                        <p className="text-4xl font-bold text-primary mb-2">2h</p>
                        <p className="text-sm text-foreground-muted font-medium">session active</p>
                    </Card>
                </div>

                {/* Profile Selector */}
                <div className="max-w-6xl mx-auto mb-12">
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
                        <Card className="p-6 bg-error-light shadow-md border-0">
                            <p className="text-error font-medium text-center">{error}</p>
                        </Card>
                    )}

                    {fileCount > 0 && (
                        <>
                            <FileList
                                files={files}
                                onRemove={removeFile}
                                disabled={isUploading}
                            />

                            <div className="flex items-center justify-between gap-4 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={clearFiles}
                                    disabled={isUploading}
                                    size="lg"
                                >
                                    Tout effacer
                                </Button>

                                <Button
                                    onClick={uploadFiles}
                                    disabled={!canUpload}
                                    size="lg"
                                    className="gap-2 px-8"
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
                <div className="max-w-6xl mx-auto mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card hover className="p-8 text-center">
                        <div className="w-16 h-16 bg-primary-light rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <Zap className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-3 text-lg">Rapide</h3>
                        <p className="text-sm text-foreground-muted leading-relaxed">
                            Classification instantanée de dizaines de documents en quelques secondes
                        </p>
                    </Card>

                    <Card hover className="p-8 text-center">
                        <div className="w-16 h-16 bg-success-light rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <Shield className="h-8 w-8 text-success" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-3 text-lg">Sécurisé</h3>
                        <p className="text-sm text-foreground-muted leading-relaxed">
                            Vos fichiers sont automatiquement supprimés après 2 heures
                        </p>
                    </Card>

                    <Card hover className="p-8 text-center">
                        <div className="w-16 h-16 bg-warning-light rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <Target className="h-8 w-8 text-warning" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-3 text-lg">Intelligent</h3>
                        <p className="text-sm text-foreground-muted leading-relaxed">
                            IA entraînée pour reconnaître automatiquement le type de vos documents
                        </p>
                    </Card>
                </div>
            </main>

            <Footer />
        </div>
    );
}