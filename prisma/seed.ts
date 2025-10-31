import { PrismaClient } from '@prisma/client';
import { loadTaxonomy } from '../src/lib/classification/taxonomy.js';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // Clear existing data first
    console.log('🧹 Clearing existing categories...');
    await prisma.category.deleteMany();

    // Charger la taxonomie
    const categories = loadTaxonomy();

    console.log(`📦 Loading ${categories.length} categories...`);

    // Créer les catégories principales
    for (const category of categories) {
        console.log(`  ➕ Creating category: ${category.name}`);

        const created = await prisma.category.create({
            data: {
                id: category.id,
                name: category.name,
                nameEn: category.nameEn,
                profiles: category.profiles,
                keywords: category.keywords,
                priority: category.priority,
                icon: category.icon,
                color: category.color,
            },
        });

        // Créer les sous-catégories
        if (category.children && category.children.length > 0) {
            console.log(`    ➕ Creating ${category.children.length} subcategories...`);

            for (const subCategory of category.children) {
                await prisma.category.create({
                    data: {
                        id: subCategory.id,
                        name: subCategory.name,
                        nameEn: subCategory.nameEn,
                        parentId: created.id,
                        profiles: subCategory.profiles,
                        keywords: subCategory.keywords,
                        priority: subCategory.priority,
                    },
                });
            }
        }
    }

    console.log('✅ Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });