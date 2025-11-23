/**
 * @fileoverview API route pour l'authentification NextAuth.
 *
 * Ce endpoint gère l'authentification via NextAuth.js,
 * incluant la connexion, déconnexion et gestion des sessions.
 *
 * @module api/auth
 * @author DocClassifier Team
 */

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Handler NextAuth pour les requêtes d'authentification.
 * @type {NextAuthHandler}
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
