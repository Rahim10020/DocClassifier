import { Prisma } from '@prisma/client';

// Base User type from Prisma
export type User = Prisma.UserGetPayload<{}>;

// User without sensitive fields (e.g., for API responses)
export type UserWithoutPassword = Omit<User, 'password'>;

// User creation input (without id, createdAt, etc.)
export interface UserCreateInput extends Omit<User, 'id' | 'createdAt' | 'updatedAt'> { }

// User update input
export interface UserUpdateInput extends Partial<UserCreateInput> { }