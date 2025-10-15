import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Database seed script to populate initial data
 */

async function main() {
    console.log('🌱 Starting database seeding...');

    // Create admin user
    const adminEmail = 'admin@classifier.app';
    const adminPassword = await bcrypt.hash('admin123', 10);

    const adminUser = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            password: adminPassword,
        },
    });

    console.log('✅ Created admin user:', adminUser.email);

    // Create demo user
    const demoEmail = 'demo@classifier.app';
    const demoPassword = await bcrypt.hash('demo123', 10);

    const demoUser = await prisma.user.upsert({
        where: { email: demoEmail },
        update: {},
        create: {
            email: demoEmail,
            password: demoPassword,
        },
    });

    console.log('✅ Created demo user:', demoUser.email);

    // Create sample classifications for demo user
    const sampleClassifications = [
        {
            userId: demoUser.id,
            sessionId: 'sample_session_1',
            status: 'READY' as const,
            proposedStructure: [
                {
                    name: 'Invoices',
                    path: '/Invoices',
                    children: [
                        {
                            name: '2024',
                            path: '/Invoices/2024',
                            children: [
                                { name: 'Q1', path: '/Invoices/2024/Q1' },
                                { name: 'Q2', path: '/Invoices/2024/Q2' },
                            ],
                        },
                    ],
                },
                {
                    name: 'Contracts',
                    path: '/Contracts',
                    children: [
                        {
                            name: 'Service Agreements',
                            path: '/Contracts/Service Agreements',
                        },
                        {
                            name: 'NDA',
                            path: '/Contracts/NDA',
                        },
                    ],
                },
                {
                    name: 'Reports',
                    path: '/Reports',
                    children: [
                        {
                            name: 'Financial',
                            path: '/Reports/Financial',
                        },
                        {
                            name: 'Technical',
                            path: '/Reports/Technical',
                        },
                    ],
                },
            ],
            totalDocuments: 15,
            totalSize: 5242880, // 5MB
        },
        {
            userId: demoUser.id,
            sessionId: 'sample_session_2',
            status: 'PROCESSING' as const,
            proposedStructure: [
                {
                    name: 'Correspondence',
                    path: '/Correspondence',
                    children: [
                        {
                            name: 'Internal',
                            path: '/Correspondence/Internal',
                        },
                        {
                            name: 'External',
                            path: '/Correspondence/External',
                        },
                    ],
                },
                {
                    name: 'Marketing Materials',
                    path: '/Marketing Materials',
                },
            ],
            totalDocuments: 8,
            totalSize: 2097152, // 2MB
        },
    ];

    for (const classificationData of sampleClassifications) {
        const classification = await prisma.classification.upsert({
            where: { sessionId: classificationData.sessionId },
            update: {},
            create: classificationData,
        });

        console.log('✅ Created classification:', classification.sessionId);

        // Create sample documents for each classification
        const sampleDocuments = [
            {
                classificationId: classification.id,
                originalName: 'invoice_jan_2024.pdf',
                filename: 'sample_invoice_001.pdf',
                fileSize: 245760,
                mimeType: 'application/pdf',
                categoryName: 'Q1',
                categoryPath: '/Invoices/2024/Q1',
                confidence: 0.95,
                extractedText: 'Sample invoice text content for January 2024...',
            },
            {
                classificationId: classification.id,
                originalName: 'contract_service_level.pdf',
                filename: 'sample_contract_001.pdf',
                fileSize: 512000,
                mimeType: 'application/pdf',
                categoryName: 'Service Agreements',
                categoryPath: '/Contracts/Service Agreements',
                confidence: 0.88,
                extractedText: 'Service level agreement between parties...',
            },
            {
                classificationId: classification.id,
                originalName: 'financial_report_q4.pdf',
                filename: 'sample_report_001.pdf',
                fileSize: 1024000,
                mimeType: 'application/pdf',
                categoryName: 'Financial',
                categoryPath: '/Reports/Financial',
                confidence: 0.92,
                extractedText: 'Quarterly financial report with revenue and expenses...',
            },
        ];

        for (const docData of sampleDocuments) {
            await prisma.documentMetadata.upsert({
                where: {
                    id: `sample_doc_${classification.id}_${docData.filename}`,
                },
                update: {},
                create: {
                    id: `sample_doc_${classification.id}_${docData.filename}`,
                    ...docData,
                },
            });
        }

        console.log(`✅ Created ${sampleDocuments.length} sample documents for ${classification.sessionId}`);
    }

    // Create sample categories for reference
    const sampleCategories = [
        {
            name: 'Business Documents',
            description: 'General business documents and correspondence',
            color: '#3B82F6',
        },
        {
            name: 'Financial Records',
            description: 'Invoices, receipts, and financial statements',
            color: '#10B981',
        },
        {
            name: 'Legal Documents',
            description: 'Contracts, agreements, and legal papers',
            color: '#F59E0B',
        },
        {
            name: 'Technical Documents',
            description: 'Technical specifications and documentation',
            color: '#8B5CF6',
        },
        {
            name: 'Marketing Materials',
            description: 'Marketing collateral and promotional materials',
            color: '#EC4899',
        },
    ];

    for (const categoryData of sampleCategories) {
        // Note: This would require a Category model in your schema
        // For now, we'll skip this as the schema doesn't include a Category table
        console.log(`ℹ️  Category "${categoryData.name}" would be created (requires Category model)`);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Login credentials:');
    console.log(`Admin: ${adminEmail} / admin123`);
    console.log(`Demo: ${demoEmail} / demo123`);
}

main()
    .catch((e) => {
        console.error('❌ Error during database seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });