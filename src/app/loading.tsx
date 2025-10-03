import LoadingSpinner from '@/components/common/LoadingSpinner';

/**
 * Global loading component for Next.js app router
 * Displays while pages are being loaded
 */
export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center space-y-4">
                <LoadingSpinner size={48} className="text-primary" />
                <div className="text-center">
                    <h2 className="text-lg font-semibold text-foreground mb-2">
                        Loading...
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Please wait while we load your content
                    </p>
                </div>
            </div>
        </div>
    );
}