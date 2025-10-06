import { notFound } from 'next/navigation';
import { getClassificationById } from '@/lib/db/queries/classifications';
import { getDocumentsByClassificationId } from '@/lib/db/queries/documents';
import ReviewPageClient from './ReviewPageClient';

interface ReviewPageProps {
    params: { classificationId: string };
}

export default async function ReviewPage({ params }: ReviewPageProps) {
    const { classificationId } = await params;
    const classification = await getClassificationById(classificationId);
    if (!classification) {
        notFound();
    }

    const documents = await getDocumentsByClassificationId(classificationId);

    // Parse proposedStructure with proper fallback structure
    let proposedStructure;
    try {
        proposedStructure = JSON.parse(classification.proposedStructure || '{"categories": []}');
    } catch (error) {
        console.warn('Failed to parse proposedStructure:', error);
        proposedStructure = { categories: [] };
    }

    return (
        <ReviewPageClient
            classification={classification}
            documents={documents}
            proposedStructure={proposedStructure}
            classificationId={classificationId}
        />
    );
}