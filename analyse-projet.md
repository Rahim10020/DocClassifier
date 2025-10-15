# Analyse du Projet DocClassifier

## Vue d'ensemble

DocClassifier est une application web moderne développée avec **Next.js 15** et **TypeScript** qui permet de **classifier automatiquement des documents** en utilisant des algorithmes de machine learning. L'application offre une interface intuitive pour uploader des documents, les organiser automatiquement par catégories, permettre à l'utilisateur de réviser et ajuster la classification, puis télécharger le résultat organisé.

## Architecture Générale

### Technologies Principales
- **Frontend** : Next.js 15, React 19, TypeScript
- **Base de données** : PostgreSQL avec Prisma ORM
- **Authentification** : NextAuth.js
- **UI/Styling** : Tailwind CSS, Radix UI, Lucide React
- **Machine Learning** : ml-kmeans, natural (NLP)
- **Traitement de fichiers** : Support PDF, DOCX, XLSX, TXT
- **État** : Zustand
- **Drag & Drop** : @dnd-kit

## Structure de la Base de Données

### Modèles Principaux

#### 1. User (Utilisateur)
- Gestion de l'authentification
- Relation one-to-many avec les classifications
- Champs : id, email, password (hashé), emailVerified, image, timestamps

#### 2. Classification (Session de classification)
- Représente une session de traitement de documents
- **Statuts** : PROCESSING → READY → VALIDATED → DOWNLOADED → EXPIRED
- Structure proposée par l'algorithme (JSON)
- Structure finale modifiée par l'utilisateur (JSON)
- Métadonnées : nombre de documents, taille totale, expiration automatique

#### 3. DocumentMetadata (Métadonnées des documents)
- Métadonnées des fichiers (pas le contenu)
- Stockage temporaire des fichiers dans `/tmp`
- Extraction de texte pour analyse
- Association avec une catégorie et un score de confiance
- Nettoyage automatique après expiration

## Système de Classification Automatique

### Architecture ML

#### 1. Pipeline de Traitement (`src/lib/classifier/`)
- **Extracteurs de texte** : PDF, DOCX, XLSX, TXT (`src/lib/classifier/parsers/`)
- **Vectorisation** : TF-IDF (`src/lib/classifier/tfidf.ts`)
- **Analyse** : Extraction de mots-clés (`src/lib/classifier/keywordExtractor.ts`)
- **Clustering** : K-means avec recherche optimale du nombre de clusters (`src/lib/classifier/clustering.ts`)
- **Catégorisation** : Assignation automatique (`src/lib/classifier/categorizer.ts`)

#### 2. Algorithme de Classification
1. **Extraction de texte** de tous les documents
2. **Vectorisation TF-IDF** pour représenter le contenu
3. **Détermination optimale de K** (nombre de catégories) avec la méthode du coude
4. **Clustering K-means** pour regrouper les documents similaires
5. **Génération de noms de catégories** basés sur les mots-clés du cluster
6. **Assignation de scores de confiance** basés sur la distance euclidienne

### Fichiers Clés du ML
- [`src/lib/classifier/categorizer.ts`](src/lib/classifier/categorizer.ts) - Fonction principale de classification
- [`src/lib/classifier/analyzer.ts`](src/lib/classifier/analyzer.ts) - Calcul TF-IDF et analyse de texte
- [`src/lib/classifier/clustering.ts`](src/lib/classifier/clustering.ts) - Algorithmes de clustering
- [`src/lib/classifier/parsers/`](src/lib/classifier/parsers/) - Extracteurs de texte par type de fichier

## Interface Utilisateur

### Structure des Pages

#### Pages d'Authentification (`src/app/(auth)/`)
- **Login** (`src/app/(auth)/login/page.tsx`) - Connexion utilisateur
- **Register** (`src/app/(auth)/register/page.tsx`) - Inscription
- **Forgot Password** (`src/app/(auth)/forgot-password/page.tsx`) - Récupération de mot de passe

#### Pages Principales (`src/app/(dashboard)/`)
- **Upload** (`src/app/(dashboard)/upload/page.tsx`) - Upload de documents
- **Review** (`src/app/(dashboard)/review/[classificationId]/`) - Révision de classification
- **Profile** (`src/app/(dashboard)/profile/page.tsx`) - Gestion du profil utilisateur

### Composants Clés

#### Layout (`src/components/layout/`)
- **Sidebar** - Navigation principale
- **Header** - En-tête avec menu utilisateur
- **Footer** - Pied de page

#### Upload (`src/components/upload/`)
- **DropZone** - Zone de dépôt de fichiers
- **FileList** - Liste des fichiers uploadés
- **UploadProgress** - Progression du traitement

#### Review (`src/components/review/`)
- **CategoryTree** - Arbre hiérarchique des catégories
- **DocumentItem** - Élément document avec drag & drop
- **CategoryEditor** - Édition des catégories
- **ConfidenceIndicator** - Indicateur de confiance de classification

#### Communs (`src/components/common/`)
- **LoadingSpinner**, **ErrorMessage**, **StatusBadge** - Composants utilitaires

## API Routes

### Authentification (`src/app/api/auth/`)
- **NextAuth** (`src/app/api/auth/[...nextauth]/route.ts`) - Configuration NextAuth
- **Logout** (`src/app/api/auth/logout/route.ts`) - Déconnexion
- **Register** (`src/app/api/auth/register/route.ts`) - Inscription

### Gestion des Classifications (`src/app/api/classification/`)
- **GET** - Liste des classifications avec pagination
- **POST** - Création de classification
- **[id]/process** - Traitement en arrière-plan
- **[id]/validate** - Validation de la structure
- **[id]/download** - Téléchargement du ZIP organisé
- **[id]/status** - Statut du traitement

### Gestion des Documents (`src/app/api/documents/`)
- **GET** - Récupération des documents d'une classification
- **[id]/move** - Déplacement de document
- **[id]/preview** - Aperçu du document
- **bulk-delete** - Suppression en lot

### Upload (`src/app/api/upload/route.ts`)
- Traitement multipart/form-data
- Validation des fichiers
- Stockage temporaire
- Création de la session de classification

## Hooks Personnalisés (`src/hooks/`)

- **useAuth** - Gestion de l'authentification
- **useClassification** - Gestion des classifications
- **useUpload** - Gestion des uploads
- **useCategoryTree** - Gestion de l'arbre des catégories
- **useDragDrop** - Fonctionnalités drag & drop

## Services et Utilitaires (`src/lib/`)

### API (`src/lib/api/`)
- **apiClient** - Client HTTP pour les appels API
- **classification**, **documents** - Services métier

### Authentification (`src/lib/auth/`)
- **authOptions** - Configuration NextAuth
- **session** - Gestion des sessions

### Stockage (`src/lib/storage/`)
- **tempStorage** - Gestion du stockage temporaire
- **fileManager** - Gestion des fichiers
- **zipGenerator** - Génération de ZIP organisés

### Validateurs (`src/lib/validators/`)
- Schémas Zod pour la validation des données

## Flux de Fonctionnement

### 1. Upload des Documents
1. Utilisateur sélectionne des fichiers via `DropZone`
2. Validation côté client avec `uploadSchemas`
3. Upload vers `POST /api/upload`
4. Stockage temporaire dans `/tmp/{sessionId}/`
5. Création de l'enregistrement `Classification` en statut `PROCESSING`

### 2. Traitement Automatique
1. Extraction de texte via les parsers appropriés
2. Vectorisation TF-IDF
3. Clustering K-means avec recherche optimale de K
4. Génération de la structure proposée
5. Mise à jour du statut vers `READY`

### 3. Révision Interactive
1. Affichage de l'arbre des catégories avec `CategoryTree`
2. Drag & drop des documents avec `@dnd-kit`
3. Édition des catégories avec `CategoryEditor`
4. Validation finale de la structure

### 4. Téléchargement
1. Génération d'un ZIP organisé avec `zipGenerator`
2. Téléchargement via `GET /api/classification/[id]/download`
3. Mise à jour du statut vers `DOWNLOADED`

## Sécurité et Performance

### Sécurité
- Authentification obligatoire pour toutes les opérations
- Validation des fichiers (type, taille)
- Nettoyage automatique des fichiers temporaires
- Secrets pour les jobs en arrière-plan

### Performance
- Traitement asynchrone en arrière-plan
- Pagination pour les listes
- Optimisations des requêtes avec les index Prisma
- Cache et debounce pour les interactions UI

## Points d'Extension

### Fonctionnalités Potentielles
- Support de plus de formats de fichiers
- Algorithmes de classification avancés (deep learning)
- Intégration avec des services cloud (AWS S3, Google Drive)
- API publique pour intégrations tierces
- Analyses statistiques avancées

### Améliorations Techniques
- Tests unitaires et d'intégration
- Monitoring et logging avancés
- Optimisation des performances ML
- Interface API plus riche

Cette architecture modulaire et bien structurée permet une maintenance facile et une évolutivité importante du système de classification de documents.