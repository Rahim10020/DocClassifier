import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { getClassificationsByUserId } from '@/lib/db/queries/classifications';
import { getStats } from '@/app/api/classification/stats/route';
import ClassificationList from '@/components/history/ClassificationList';
import FilterBar from '@/components/history/FilterBar';
import SearchBar from '@/components/history/SearchBar';
import StatsCard from '@/components/dashboard/StatsCard';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { FileText, Calendar, CheckCircle, Files } from 'lucide-react';

export default async function HistoryPage({ searchParams }: { searchParams: { page?: string; status?: string; search?: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return <div>Non autorisé</div>;
    }

    const page = parseInt(searchParams.page || '1', 10);
    const status = searchParams.status;
    const search = searchParams.search;

    const { classifications, total, pages } = await fetchClassifications(session.user.id, { page, status, search });
    const stats = await getStats(session.user.id);

    return (
        <Suspense fallback={<LoadingSpinner />}>
            <div className="p-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <StatsCard title="Total Classifications" value={stats.total} icon={FileText} trend={stats.trendTotal} />
                    <StatsCard title="Ce Mois" value={stats.thisMonth} icon={Calendar} trend={stats.trendThisMonth} />
                    <StatsCard title="Taux de Succès" value={`${stats.successRate}%`} icon={CheckCircle} trend={stats.trendSuccess} />
                    <StatsCard title="Documents Traités" value={stats.totalDocuments} icon={Files} trend={stats.trendDocuments} />
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row justify-between mb-4">
                    <FilterBar initialStatus={status} />
                    <SearchBar initialSearch={search} />
                </div>

                {/* List */}
                {classifications.length === 0 ? (
                    <EmptyState
                        title="Aucune classification trouvée"
                        description="Il n'y a aucune classification à afficher pour le moment."
                    />
                ) : (
                    <ClassificationList classifications={classifications} />
                )}

                {/* Pagination */}
                {pages > 1 && (
                    <Pagination>
                        <PaginationContent>
                            {page > 1 && (
                                <PaginationItem>
                                    <PaginationPrevious href={`?page=${page - 1}${status ? `&status=${status}` : ''}${search ? `&search=${search}` : ''}`} />
                                </PaginationItem>
                            )}

                            {/* Page numbers */}
                            {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                                let pageNumber;
                                if (pages <= 5) {
                                    pageNumber = i + 1;
                                } else if (page <= 3) {
                                    pageNumber = i + 1;
                                } else if (page >= pages - 2) {
                                    pageNumber = pages - 4 + i;
                                } else {
                                    pageNumber = page - 2 + i;
                                }

                                return (
                                    <PaginationItem key={pageNumber}>
                                        <PaginationLink
                                            href={`?page=${pageNumber}${status ? `&status=${status}` : ''}${search ? `&search=${search}` : ''}`}
                                            isActive={pageNumber === page}
                                        >
                                            {pageNumber}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            })}

                            {page < pages && (
                                <PaginationItem>
                                    <PaginationNext href={`?page=${page + 1}${status ? `&status=${status}` : ''}${search ? `&search=${search}` : ''}`} />
                                </PaginationItem>
                            )}
                        </PaginationContent>
                    </Pagination>
                )}
            </div>
        </Suspense>
    );
}

// Helper fetch
async function fetchClassifications(userId: string, filters: { page: number; status?: string; search?: string }) {
    try {
        const params = new URLSearchParams({
            userId,
            page: filters.page.toString(),
            ...(filters.status && filters.status !== 'all' ? { status: filters.status } : {}),
            ...(filters.search ? { search: filters.search } : {}),
        });

        const res = await fetch(`/api/classification?${params.toString()}`);
        if (!res.ok) {
            console.error('Failed to fetch classifications:', res.statusText);
            throw new Error('Failed to fetch classifications');
        }

        return await res.json();
    } catch (error) {
        console.error('Error fetching classifications:', error);
        throw new Error('Impossible de charger les classifications. Veuillez réessayer plus tard.');
    }
}