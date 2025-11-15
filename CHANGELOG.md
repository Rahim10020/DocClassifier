# Changelog

Toutes les modifications notables apportées au projet DocClassifier sont documentées dans ce fichier.

## [Améliorations] - 2025-11-15

### Correctifs de Sécurité

#### Vulnérabilités Critiques Corrigées
- **Protection contre Path Traversal** (`src/lib/storage.ts`)
  - Ajout d'une validation stricte des `sessionId` avec regex
  - Vérification des chemins résolus pour éviter l'accès à des fichiers hors du répertoire de session
  - Validation de la longueur et des caractères autorisés dans les IDs de session

- **Protection contre ReDoS** (`src/lib/classification/scorer.ts`)
  - Limitation de la longueur des mots-clés à 100 caractères
  - Ajout de gestion d'erreurs try-catch pour les opérations regex
  - Protection contre le catastrophic backtracking

### Améliorations de Performance

#### Optimisation des Opérations de Base de Données
- **Requêtes parallèles** (`src/app/api/session/update/route.ts`)
  - Remplacement des boucles séquentielles par `Promise.all()`
  - Réduction du temps de mise à jour de plusieurs documents
  - Meilleure gestion des erreurs par document

### Corrections de Race Conditions

#### Hooks React
- **useSession Hook** (`src/hooks/useSession.ts`)
  - Ajout de `useRef` pour éviter les appels fetch concurrents
  - Gestion appropriée des intervalles avec cleanup
  - Prévention des fuites mémoire

- **Processing Page** (`src/app/processing/[sessionId]/page.tsx`)
  - Utilisation de refs pour éviter les appels API multiples
  - Cleanup approprié des timeouts
  - Meilleure gestion des dépendances useEffect

### Améliorations TypeScript

#### Validation des Types
- **Upload Route** (`src/app/api/upload/route.ts`)
  - Validation explicite des types File au lieu de type assertions
  - Vérification de type pour profile et language
  - Meilleure gestion des erreurs de validation

- **Download Route** (`src/app/api/download/route.ts`)
  - Ajout de gestion d'erreurs dans les callbacks setTimeout
  - Protection contre les erreurs silencieuses

### Nouvelles Fonctionnalités

#### Gestion des Erreurs
- **ErrorBoundary** (`src/components/shared/ErrorBoundary.tsx`)
  - Composant React Error Boundary pour capturer les erreurs
  - Affichage d'erreurs détaillées en mode développement
  - Options de récupération (Réessayer / Retour à l'accueil)

#### Système de Notifications
- **Toast System** (`src/components/ui/toast.tsx`)
  - Système de notifications toast avec animations
  - Support de 4 types: success, error, warning, info
  - Auto-dismiss configurable
  - Animations fluides avec Framer Motion

### Améliorations UI/UX

#### Layout Global
- Intégration de ErrorBoundary dans le layout principal
- Ajout du ToastProvider pour notifications globales
- Amélioration des métadonnées SEO

### Validation des Données

#### API Routes
- **Session Update** (`src/app/api/session/update/route.ts`)
  - Validation des types pour mainCategory et subCategory
  - Messages d'erreur plus précis

### Corrections de Bugs

#### Storage
- Gestion correcte des extensions de fichiers manquantes
- Protection contre les chemins de fichiers malveillants

#### Scorer
- Gestion des erreurs regex
- Protection contre les mots-clés trop longs

### Améliorations de Code

#### Qualité du Code
- Réduction des type assertions dangereuses
- Meilleure gestion des erreurs asynchrones
- Cleanup approprié des ressources (timeouts, intervals)
- Documentation améliorée avec commentaires

#### Architecture
- Séparation des préoccupations améliorée
- Meilleure gestion d'état avec refs
- Prévention des fuites mémoire

---

## Notes de Migration

Si vous migrez depuis une version antérieure :

1. **Variables d'Environnement** - Assurez-vous que toutes les variables d'environnement sont correctement configurées
2. **Base de Données** - Aucune migration de schéma requise
3. **Dépendances** - Exécutez `npm install` pour vous assurer que toutes les dépendances sont à jour

## Prochaines Améliorations Prévues

- [ ] Internationalisation (i18n) complète
- [ ] Mode sombre/clair
- [ ] Compression des fichiers avant upload
- [ ] Support de plus de formats de documents
- [ ] Amélioration de l'algorithme de classification
- [ ] Dashboard d'analytics
- [ ] Support multi-utilisateurs avec authentification
