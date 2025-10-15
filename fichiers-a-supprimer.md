# Fichiers à Supprimer - Analyse de Nettoyage

## Fichiers Doublons/Redondants Identifiés

### 1. Système de Classification Dupliqué ❌
**`src/classifier/categorizer.ts`** - **À SUPPRIMER**
- Version orientée objet non utilisée
- Remplacé par `src/lib/classifier/categorizer.ts` (fonctionnel)
- Utilise des dépendances externes différentes (pas cohérent avec le projet)

**`src/classifier/`** (dossier entier potentiellement) - **À VÉRIFIER**
- Contient une ancienne implémentation du système de classification
- La nouvelle version est dans `src/lib/classifier/`

### 2. Fichiers de Configuration Dupliqués ⚠️
**`src/config/constants.ts`** - **À SUPPRIMER**
- Non utilisé dans le projet (vérifié avec grep)
- Remplacé par `src/lib/utils/constants.ts`

### 3. Extracteurs de Texte Dupliqués ⚠️
**`src/process/textExtractor.ts`** - **GARDER**
- Utilisé par `src/process/documentWorker.ts`
- Version différente de `src/lib/classifier/textExtractor.ts`

**`src/lib/classifier/textExtractor.ts`** - **GARDER**
- Utilisé par `src/app/api/classification/[id]/process/route.ts`
- Version différente mais complémentaire

### 4. Fichiers Suspects (Vérifiés)

#### Ancien Système de Traitement
**`src/process/route.ts`** - **GARDER (mais vérifier l'utilisation)**
- Système de worker threads potentiellement utilisé
- Nécessite vérification approfondie avant suppression

**`src/process/documentWorker.ts`** - **GARDER**
- Worker pour le traitement de documents
- Utilise `src/process/textExtractor.ts`

#### Fichiers de Configuration ✅
**`src/config/site.ts`** - **GARDER**
- Utilisé par `src/hooks/useUpload.tsx`

**`src/config/nav.ts`** - **GARDER**
- Utilisé par `src/components/layout/Footer.tsx`

## Analyse des Dépendances

### Fichiers Confirmés comme Utilisés ✅
- `src/lib/classifier/categorizer.ts` - Utilisé par process route
- `src/lib/classifier/textExtractor.ts` - Utilisé par process route
- `src/process/textExtractor.ts` - Utilisé par documentWorker
- `src/lib/utils/constants.ts` - Vérifier utilisation
- `src/lib/storage/` - Tous utilisés par les API
- `src/lib/validators/` - Tous utilisés par les API
- `src/lib/db/` - Tous utilisés par les API
- `src/hooks/` - Tous utilisés par les composants
- `src/components/` - Tous utilisés par les pages
- `src/app/api/` - Tous utilisés par le frontend

### Fichiers Probablement Inutiles ❌
1. `src/classifier/categorizer.ts` - Doublon confirmé
2. `src/config/constants.ts` - Non utilisé
3. Potentiellement `src/process/route.ts` - Ancien système
4. Potentiellement `src/process/documentWorker.ts` - Ancien système

## Recommandations de Suppression

### Suppression Effectuée ✅
```bash
# ✅ SUPPRIMÉ - categorizer dupliqué (non utilisé)
rm src/classifier/categorizer.ts

# ✅ SUPPRIMÉ - constantes dupliquées (non utilisées)
rm src/config/constants.ts
```

### Fichiers Identifiés comme Inutiles (Recommandation)
**`src/classifier/`** - **DOIT ÊTRE SUPPRIMÉ**
- Dossier entier non utilisé (fichiers restants : elbow.ts, types.ts, clustering/, vectorizers/)
- Ancienne implémentation remplacée par `src/lib/classifier/`

### Suppression Potentielle (Nécessite vérification approfondie)
```bash
# Ancien système de traitement - RECOMMANDÉ POUR SUPPRESSION
rm -rf src/process/

# Ancien système de classification - RECOMMANDÉ POUR SUPPRESSION
rm -rf src/classifier/
```

### Fichiers Confirmés comme Utiles ✅
1. `src/config/site.ts` - Utilisé par useUpload
2. `src/config/nav.ts` - Utilisé par Footer
3. `src/lib/` - Tout le dossier utilisé
4. `src/components/` - Tout le dossier utilisé
5. `src/hooks/` - Tout le dossier utilisé
6. `src/app/api/` - Tout le dossier utilisé

## Actions Requises

1. **Vérifier l'utilisation** de `src/process/route.ts`
2. **Vérifier l'utilisation** de `src/config/site.ts` et `src/config/nav.ts`
3. **Confirmer** que `src/process/documentWorker.ts` peut être supprimé
4. **Examiner** le contenu de `src/classifier/` pour voir s'il reste des fichiers utiles

## Risques
- Suppression de fichiers encore utilisés = **ERREUR CRITIQUE**
- Perte de fonctionnalités importantes

## Bénéfices Attendues
- **Nettoyage** du code base
- **Réduction** de la confusion entre systèmes similaires
- **Amélioration** de la maintenabilité
- **Diminution** de la taille du projet