import prisma from '../prisma';

// Define the User type based on Prisma schema
type User = {
    id: string;
    email: string;
    name?: string | null;
    password: string;
    emailVerified?: Date | null;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export async function getUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
}

export async function updateUser(id: string, data: Partial<User>): Promise<User> {
    return prisma.user.update({ where: { id }, data });
}

export async function deleteUser(id: string): Promise<User> {
    return prisma.user.delete({ where: { id } });
}

export async function getUserStats(id: string): Promise<{
    totalClassifications: number;
    totalDocuments: number;
    createdAt: Date;
    lastActivity: Date | null;
    // chartData?: any[];
}> {
    const classifications = await prisma.classification.count({ where: { userId: id } });
    const documents = await prisma.document.count({ where: { classification: { userId: id } } });
    const user = await getUserById(id);

    return {
        totalClassifications: classifications,
        totalDocuments: documents,
        createdAt: user?.createdAt || new Date(),
        lastActivity: user?.updatedAt || null,
        // chartData: ...
    };
}