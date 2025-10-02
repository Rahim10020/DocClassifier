import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { getClassificationById } from '@/lib/db/queries/classifications';
import ClassificationDetails from '@/components/history/ClassificationDetails';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface DetailsPageProps {
    params: { classificationId: string };
}

export default async function DetailsPage({ params }: DetailsPageProps) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return <div>Unauthorized</div>;
    }

    const classification = await getClassificationById(params.classificationId);
    if (!classification || classification.userId !== session.user.id) {
        notFound();
    }

    return (
        <div className="p-6">
            <Link href="/dashboard/history">
                <Button variant="outline" className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                </Button>
            </Link>
            <ClassificationDetails classification={classification} />
        </div>
    );
}