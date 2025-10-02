<!-- README.md -->

# DocClassifier

## Description
DocClassifier est une application web pour classer automatiquement des documents textuels en catégories dynamiques en utilisant des algorithmes NLP comme TF-IDF et clustering. Elle permet l'upload, la révision interactive, et le téléchargement en ZIP structuré.

## Features
- Authentification sécurisée (login, register, forgot password)
- Upload de documents (PDF, DOCX, TXT, XLSX)
- Classification automatique avec scoring de confiance
- Révision interactive (drag & drop, merge, edit)
- Historique et détails des classifications
- Téléchargement ZIP structuré
- Statistiques utilisateur
- Nettoyage automatique des fichiers expirés

## Tech Stack
- Frontend: Next.js, React, Tailwind CSS, shadcn/ui
- Backend: Next.js API Routes, Prisma ORM, PostgreSQL
- Librairies: pdf-parse, mammoth, xlsx, natural, ml-kmeans, archiver, @dnd-kit, zod, bcryptjs
- Déploiement: Vercel (avec CRON)

## Installation
1. Clonez le repo: `git clone <repo-url>`
2. Installez les dépendances: `pnpm install` (ou npm/yarn)
3. Configurez .env.local (voir .env.example)
4. Générez Prisma: `npx prisma generate`
5. Migrez DB: `npx prisma migrate dev`
6. Lancez le serveur: `pnpm dev`

## Configuration .env
- DATABASE_URL: PostgreSQL connection string
- NEXTAUTH_SECRET: Secret for NextAuth
- NEXTAUTH_URL: URL de l'app
- CRON_SECRET: Secret pour CRON cleanup

## Commandes disponibles
- `pnpm dev`: Développement
- `pnpm build`: Build production
- `pnpm start`: Start production
- `pnpm lint`: Lint code
- `pnpm test`: Run tests

## Architecture
- /src/app: Next.js pages et API routes
- /src/components: Composants React
- /src/lib: Utilitaires, DB queries, validators
- /src/hooks: Custom hooks
- /prisma: Schéma DB

## Déploiement
- Déployez sur Vercel
- Configurez env vars
- Vérifiez CRON dans vercel.json
- Ajoutez domaine custom si besoin