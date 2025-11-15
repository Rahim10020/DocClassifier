'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-background p-6">
                    <Card className="p-10 max-w-2xl w-full shadow-2xl">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-error-light rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                                <AlertCircle className="h-10 w-10 text-error" />
                            </div>

                            <h1 className="text-3xl font-bold text-foreground mb-3">
                                Oups ! Une erreur est survenue
                            </h1>

                            <p className="text-foreground-muted mb-8 text-lg">
                                Nous sommes désolés, quelque chose s&apos;est mal passé.
                            </p>

                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <div className="mb-8 p-4 bg-error-light rounded-lg text-left">
                                    <p className="text-sm font-mono text-error font-semibold mb-2">
                                        {this.state.error.toString()}
                                    </p>
                                    {this.state.errorInfo && (
                                        <details className="mt-4">
                                            <summary className="cursor-pointer text-sm text-foreground-muted hover:text-foreground">
                                                Détails de l&apos;erreur
                                            </summary>
                                            <pre className="mt-2 text-xs text-foreground-muted overflow-auto max-h-64 p-2 bg-background rounded">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-4 justify-center">
                                <Button
                                    onClick={this.handleReset}
                                    variant="default"
                                    size="lg"
                                    className="gap-2"
                                >
                                    <RefreshCw className="h-5 w-5" />
                                    Réessayer
                                </Button>

                                <Button
                                    onClick={() => (window.location.href = '/')}
                                    variant="outline"
                                    size="lg"
                                    className="gap-2"
                                >
                                    <Home className="h-5 w-5" />
                                    Retour à l&apos;accueil
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}
