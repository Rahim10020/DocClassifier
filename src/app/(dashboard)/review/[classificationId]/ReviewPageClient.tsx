'use client';

import { useState, Suspense } from 'react';
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

// Import the Classification type from the queries file
interface Classification {
    id: string;
    userId: string;
    sessionId: string;
    status: 'PROCESSING' | 'READY' | 'VALIDATED' | 'DOWNLOADED' | 'EXPIRED';
    proposedStructure: any;
    finalStructure?: any;
    totalDocuments: number;
    totalSize: bigint;
    createdAt: Date;
    processedAt?: Date;
    validatedAt?: Date;
    downloadedAt?: Date;
    expiresAt?: Date;
}

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

    const { DndContextProvider } = useDragDrop({ onMoveDocument: () => { } });
    const {
        structure,
        isDirty,
        isSaving,
    } = useClassification({ initialClassification: classification, initialStructure: categoryNodes });

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