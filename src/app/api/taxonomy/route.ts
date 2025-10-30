import { NextRequest, NextResponse } from 'next/server';
import { loadTaxonomy, getTaxonomyByProfile, getProfileInfo, getCategoryColors } from '@/lib/classification/taxonomy';
import { Profile } from '@/types/category';

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
            });
        }

        // Retourner les couleurs des catégories
        if (type === 'colors') {
            const colors = getCategoryColors();
            return NextResponse.json({
                success: true,
                data: colors,
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