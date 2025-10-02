import { notFound } from 'next/navigation';
import { getClassificationById } from '@/lib/db/queries/classifications';
import { getDocumentsByClassificationId } from '@/lib/db/queries/documents';
import ReviewPageClient from './ReviewPageClient';

interface ReviewPageProps {
    params: { classificationId: string };
}

export default async function ReviewPage({ params }: ReviewPageProps) {
    const classification = await getClassificationById(params.classificationId);
    if (!classification) {
        notFound();
    }

    const documents = await getDocumentsByClassificationId(params.classificationId);

    const proposedStructure = JSON.parse(classification.proposedStructure || '{}');

    return (
        <ReviewPageClient
            classification={classification}
            documents={documents}
            proposedStructure={proposedStructure}
            classificationId={params.classificationId}
        />
    );
}