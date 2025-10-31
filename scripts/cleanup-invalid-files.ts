import { PrismaClient } from '@prisma/client';
import path from 'path';

const prisma = new PrismaClient();

async function cleanupInvalidFiles() {
    console.log('🔍 Recherche des documents avec des chemins de fichiers invalides...');

    // Trouver les documents dont le fileName contient un chemin relatif ou absolu
    const allDocuments = await prisma.document.findMany({
        include: {
            session: true,
        },
    });

    const invalidDocuments = allDocuments.filter(doc => {
        // Vérifier si le fileName contient un slash (indiquant un chemin)
        return doc.fileName.includes('/') || doc.fileName.includes('\\');
    });

    console.log(`📊 Trouvé ${invalidDocuments.length} document(s) avec des chemins invalides`);

    if (invalidDocuments.length === 0) {
        console.log('✅ Aucun document invalide trouvé');
        return;
    }

    // Afficher les documents invalides
    console.log('\n📝 Documents invalides:');
    for (const doc of invalidDocuments) {
        console.log(`  - ID: ${doc.id}`);
        console.log(`    Session: ${doc.sessionId}`);
        console.log(`    Original Name: ${doc.originalName}`);
        console.log(`    Invalid Path: ${doc.fileName}`);
        console.log(`    Base Name: ${path.basename(doc.fileName)}`);
        console.log('');
    }

    // Demander confirmation avant de supprimer
    console.log('🗑️  Pour supprimer ces documents, décommentez la section de suppression dans le script\n');

    // DÉCOMMENTEZ LES LIGNES SUIVANTES POUR SUPPRIMER LES DOCUMENTS INVALIDES
    /*
    console.log('🗑️  Suppression des documents invalides...');

    const deletedDocuments = await prisma.document.deleteMany({
        where: {
            id: {
                in: invalidDocuments.map(doc => doc.id),
            },
        },
    });

    console.log(`✅ ${deletedDocuments.count} document(s) supprimé(s)`);

    // Supprimer les sessions vides
    console.log('🧹 Nettoyage des sessions vides...');

    const sessions = await prisma.session.findMany({
        include: {
            _count: {
                select: { documents: true },
            },
        },
    });

    const emptySessions = sessions.filter(s => s._count.documents === 0);

    if (emptySessions.length > 0) {
        await prisma.session.deleteMany({
            where: {
                id: {
                    in: emptySessions.map(s => s.id),
                },
            },
        });
        console.log(`✅ ${emptySessions.length} session(s) vide(s) supprimée(s)`);
    }
    */
}

cleanupInvalidFiles()
    .catch((e) => {
        console.error('❌ Erreur:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
