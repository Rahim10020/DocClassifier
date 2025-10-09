'use client';

import { useState, Suspense, useEffect } from 'react';
import CategoryTree from '@/components/review/CategoryTree';
import DocumentPreview from '@/components/review/DocumentPreview';
import ClassificationStats from '@/components/review/ClassificationStats';
import ExpirationTimer from '@/components/review/ExpirationTimer';
import StructureActions from '@/components/review/StructureActions';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { buildTree } from '@/lib/utils/treeBuilder';
import { useDragDrop } from '@/hooks/useDragDrop';
import { useClassification } from '@/hooks/useClassification';
import DownloadButton from '@/components/common/DownloadButton';
import { CategoryNode } from '@/types/category';
import { TreeNode } from '@/types/tree';
import { DocumentMetadata } from '@/types/document';
import { Classification } from '@/types/classification';

interface ReviewPageClientProps {
    classification: Classification;
    documents: DocumentMetadata[];
    proposedStructure: any;
    classificationId: string;
}

function convertTreeNodeToCategoryNode(treeNode: TreeNode, documents: DocumentMetadata[]): CategoryNode {
    // Find documents that belong to this category
    const categoryDocuments = documents.filter(doc => doc.categoryName === treeNode.name);

    return {
        id: treeNode.id,
        name: treeNode.name,
        path: treeNode.name, // Simplified path for now
        children: treeNode.children?.map(child => convertTreeNodeToCategoryNode(child, documents)) || [],
        documents: categoryDocuments,
        isExpanded: false
    };
}

export default function ReviewPageClient({
    classification,
    documents,
    proposedStructure,
    classificationId
}: ReviewPageClientProps) {
    const treeNodes = buildTree(proposedStructure);
    const categoryNodes: CategoryNode[] = treeNodes.map(node => convertTreeNodeToCategoryNode(node, documents));

    const totalDocs = documents.length;
    const avgConfidence = documents.reduce((sum, doc) => sum + (doc.confidence || 0), 0) / totalDocs || 0;
    const categoryCount = categoryNodes.length;
    const confidenceBreakdown = {
        high: documents.filter((d) => (d.confidence || 0) > 0.8).length,
        medium: documents.filter((d) => (d.confidence || 0) >= 0.6 && (d.confidence || 0) <= 0.8).length,
        low: documents.filter((d) => (d.confidence || 0) < 0.6).length,
    };

    const [isValidated, setIsValidated] = useState(classification.status === 'VALIDATED');
    const [isProcessing, setIsProcessing] = useState(classification.status === 'PROCESSING');
    const [processingProgress, setProcessingProgress] = useState(0);

    // Poll for classification status updates when processing
    useEffect(() => {
        if (!isProcessing) return;

        let pollCount = 0;
        const maxPolls = 300; // Maximum 300 polls = 10 minutes at 2-second intervals
        const maxProcessingTime = 10 * 60 * 1000; // 10 minutes max processing time

        const pollStatus = async () => {
            pollCount++;

            // Stop polling if we've exceeded maximum polls or time
            const elapsed = Date.now() - new Date(classification.createdAt).getTime();
            if (pollCount >= maxPolls || elapsed >= maxProcessingTime) {
                console.warn('Classification polling stopped due to timeout');
                setIsProcessing(false);
                setProcessingProgress(100);
                // Show error message to user
                alert('Classification is taking longer than expected. Please refresh the page and try again.');
                return;
            }

            try {
                const response = await fetch(`/api/classification/${classificationId}`);
                if (response.ok) {
                    const updatedClassification = await response.json();
                    if (updatedClassification.status !== 'PROCESSING') {
                        setIsProcessing(false);
                        setProcessingProgress(100);
                        // Reload the page to get updated data
                        window.location.reload();
                    } else {
                        // Estimate progress based on time elapsed and poll count
                        // Allow progress to go up to 95% instead of 90%
                        const timeProgress = Math.min((elapsed / maxProcessingTime) * 100, 95);
                        const pollProgress = Math.min((pollCount / maxPolls) * 100, 95);
                        const estimatedProgress = Math.max(timeProgress, pollProgress);
                        setProcessingProgress(estimatedProgress);
                    }
                } else if (response.status === 408) {
                    // Timeout error from server
                    console.error('Classification processing timeout');
                    setIsProcessing(false);
                    setProcessingProgress(0);
                    alert('Classification processing timed out. Please try again.');
                }
            } catch (error) {
                console.error('Error polling classification status:', error);
                // Continue polling on network errors, but stop after max attempts
                if (pollCount >= maxPolls) {
                    setIsProcessing(false);
                    setProcessingProgress(0);
                    alert('Network error during classification. Please refresh the page.');
                }
            }
        };

        const interval = setInterval(pollStatus, 2000); // Poll every 2 seconds
        return () => clearInterval(interval);
    }, [isProcessing, classificationId, classification.createdAt]);

    const { DndContextProvider } = useDragDrop({ onMoveDocument: () => { } });
    const {
        structure,
        isDirty,
        isSaving,
    } = useClassification({ initialClassification: classification as any, initialStructure: categoryNodes });

    // Function to manually stop processing
    const stopProcessing = async () => {
        if (confirm('Êtes-vous sûr de vouloir arrêter le processus de classification ? Vous pourrez le relancer plus tard.')) {
            try {
                const response = await fetch(`/api/classification/${classificationId}/status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'READY' })
                });

                if (response.ok) {
                    setIsProcessing(false);
                    setProcessingProgress(100);
                    window.location.reload();
                } else {
                    alert('Erreur lors de l\'arrêt du processus');
                }
            } catch (error) {
                console.error('Error stopping classification:', error);
                alert('Erreur lors de l\'arrêt du processus');
            }
        }
    };

    // Show processing state if classification is still processing
    if (isProcessing) {
        return (
            <div className="flex flex-col items-center justify-center h-screen space-y-6">
                <LoadingSpinner />
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-semibold">Classification en cours...</h2>
                    <p className="text-muted-foreground">
                        Analyse et traitement de vos documents ({Math.round(processingProgress)}%)
                    </p>
                </div>
                <div className="w-64">
                    <div className="bg-gray-200 rounded-full h-3">
                        <div
                            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${processingProgress}%` }}
                        ></div>
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                        Cette opération peut prendre quelques minutes selon le nombre de fichiers.
                    </p>
                    <button
                        onClick={stopProcessing}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                        Arrêter le processus
                    </button>
                </div>
            </div>
        );
    }

    return (
        <Suspense fallback={<LoadingSpinner />}>
            <DndContextProvider>
                <div className="flex flex-col h-screen">
                    <header className="flex justify-between items-center p-4 bg-background border-b">
                        <ClassificationStats
                            totalDocs={totalDocs}
                            categoryCount={categoryCount}
                            avgConfidence={avgConfidence}
                            breakdown={confidenceBreakdown}
                        />
                        {classification.expiresAt && (
                            <ExpirationTimer expiresAt={classification.expiresAt} />
                        )}
                    </header>

                    <main className="flex flex-1 overflow-hidden">
                        <div className="w-[60%] overflow-y-auto p-4 border-r">
                            <CategoryTree tree={structure} documents={documents} />
                        </div>

                        <div className="w-[40%] overflow-y-auto p-4">
                            <DocumentPreview />
                        </div>
                    </main>

                    <footer className="p-4 bg-background border-t">
                        <StructureActions classificationId={classificationId} />
                    </footer>

                    {isDirty && <div>Modifications non sauvegardées</div>}
                    {isSaving && <div>Sauvegarde en cours...</div>}

                    {isValidated && (
                        <div className="p-4 bg-info text-info-foreground rounded">
                            <p>Téléchargez maintenant, fichiers supprimés après.</p>
                            <DownloadButton classificationId={classificationId} />
                        </div>
                    )}
                </div>
            </DndContextProvider>
        </Suspense>
    );
}