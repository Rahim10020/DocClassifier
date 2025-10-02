// src/components/review/DocumentPreview.tsx

import { Document } from '@/types/document';
import ConfidenceIndicator from './ConfidenceIndicator';
import { formatBytes } from '@/lib/utils/formatters';
import { useCategoryTree } from '@/hooks/useCategoryTree';

export default function DocumentPreview() {
    const { selectedDocument, getDocumentById, getCategoryById } = useCategoryTree();

    if (!selectedDocument) {
        return <div className="text-center text-muted-foreground">Sélectionnez un document pour prévisualiser</div>;
    }

    const doc = getDocumentById(selectedDocument);
    if (!doc) return null;

    const category = getCategoryById(doc.categoryId);

    return (
        <div className="bg-background/80 backdrop-blur-md p-6 rounded-lg shadow-lg border"> {/* Glassmorphism */}
            <h2 className="text-xl font-bold mb-4">{doc.name}</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
                <p>Type: {doc.mimeType}</p>
                <p>Taille: {formatBytes(doc.size)}</p>
                <p>Catégorie: {category?.name || 'Inconnue'}</p>
            </div>
            <div className="my-4">
                <ConfidenceIndicator confidence={doc.confidence || 0} size="large" />
            </div>
            <div className="bg-muted p-4 rounded max-h-40 overflow-y-auto">
                <p>{doc.extractedText?.slice(0, 500) || 'Aucun extrait disponible'}</p>
            </div>
            <div className="mt-4 flex space-x-2">
                <button className="btn btn-secondary">Déplacer</button>
                <button className="btn btn-secondary">Renommer</button>
            </div>
        </div>
    );
}