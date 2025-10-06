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
        const structureToParse = classification.proposedStructure && String(classification.proposedStructure).trim() !== ''
            ? classification.proposedStructure
            : '{"categories": []}';
        proposedStructure = JSON.parse(structureToParse);
    } catch (error) {
        console.warn('Failed to parse proposedStructure:', error);
        proposedStructure = { categories: [] };
    }

    // Ensure all optional fields are properly typed for the client component
    const clientClassification = {
        ...classification,
        finalStructure: classification.finalStructure ?? null,
        processedAt: classification.processedAt ?? null,
        validatedAt: classification.validatedAt ?? null,
        downloadedAt: classification.downloadedAt ?? null,
        expiresAt: classification.expiresAt ?? null,
    };

    return (
        <ReviewPageClient
            classification={clientClassification}
            documents={documents}
            proposedStructure={proposedStructure}
            classificationId={classificationId}
        />
    );
}