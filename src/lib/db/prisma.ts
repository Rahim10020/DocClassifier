// Singleton Prisma Client to prevent multiple instances in development
// See: https://pris.ly/d/client#prevent-hot-reloading-from-creating-new-instances

import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
    return new PrismaClient();
};

declare global {
    // eslint-disable-next-line no-var
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

export default prisma;

// Export generated types for convenience
export type { Prisma } from '@prisma/client';