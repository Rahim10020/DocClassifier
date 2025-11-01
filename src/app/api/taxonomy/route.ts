import { NextRequest, NextResponse } from 'next/server';
import { loadTaxonomy, getTaxonomyByProfile, getProfileInfo, getCategoryColors } from '@/lib/classification/taxonomy';
import { Profile } from '@/types/category';

//  Cache la taxonomie pendant 1 heure (elle change rarement)
export const revalidate = 3600;

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const profile = searchParams.get('profile') as Profile | null;
        const type = searchParams.get('type'); // 'categories', 'profiles', 'colors'

        // Retourner les informations de profil
        if (type === 'profiles') {
            const profiles = getProfileInfo();
            return NextResponse.json({
                success: true,
                data: profiles,
            }, {
                headers: {
                    'Cache-Control': 'public, max-age=3600, s-maxage=3600',
                }
            });
        }

        // Retourner les couleurs des catégories
        if (type === 'colors') {
            const colors = getCategoryColors();
            return NextResponse.json({
                success: true,
                data: colors,
            }, {
                headers: {
                    'Cache-Control': 'public, max-age=3600, s-maxage=3600',
                }
            });
        }

        // Retourner la taxonomie (par défaut)
        const taxonomy = profile
            ? getTaxonomyByProfile(profile)
            : loadTaxonomy();

        return NextResponse.json({
            success: true,
            data: {
                categories: taxonomy,
                total: taxonomy.length,
            },
        }, {
            headers: {
                'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            }
        });
    } catch (error) {
        console.error('Taxonomy error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erreur lors du chargement de la taxonomie',
            },
            { status: 500 }
        );
    }
}