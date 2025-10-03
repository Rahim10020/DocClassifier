import { PrismaAdapter } from '@auth/prisma-adapter';
import { type DefaultSession, type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';
import { loginSchema } from '@/lib/validators/authSchemas';

declare module 'next-auth' {
    interface Session extends DefaultSession {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        };
    }
    interface User {
        id: string;
    }
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                try {
                    const parsed = loginSchema.safeParse(credentials);
                    if (!parsed.success) {
                        throw new Error('Invalid credentials');
                    }

                    const { email, password } = parsed.data;

                    const user = await prisma.user.findUnique({ where: { email } });
                    if (!user || !user.password) {
                        throw new Error('No user found');
                    }

                    const isValid = await bcrypt.compare(password, user.password);
                    if (!isValid) {
                        throw new Error('Invalid password');
                    }

                    return { id: user.id, email: user.email, name: user.name };
                } catch (error) {
                    console.error('Authorization error:', error);
                    throw error;
                }
            },
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user, account }) {
            // Prevent openid-client related errors by ensuring proper token handling
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
        signOut: '/login',
        error: '/login?error=CredentialsSignin',
        newUser: '/register',
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
};