# Analyse des Performances de Classification

## Problème Identifié
La classification de 6 fichiers prend plus de 20 minutes, ce qui est anormalement long pour un si petit nombre de documents.

## Causes Principales

### 1. Gestion Inefficace des Mots-Clés
- **Problème** : L'extraction et le traitement des mots-clés sont trop gourmands en ressources.
- **Fichier concerné** : `keyword-extractor.ts`
- **Détails** :
  - Utilisation de regex complexes sans optimisation
  - Pas de mise en cache des résultats de stemming
  - Traitement séquentiel des mots-clés

### 2. Algorithme de Scoring Trop Complexe
- **Problème** : L'algorithme de calcul des scores est trop lent.
- **Fichier concerné** : `scorer.ts`
- **Détails** :
  - Boucles imbriquées sur les catégories et les mots-clés
  - Calculs de fréquence coûteux
  - Pas de limite sur la taille du texte analysé

### 3. Chargement de la Taxonomie
- **Problème** : La taxonomie est rechargée à chaque classification.
- **Fichier concerné** : `taxonomy.ts`
- **Détails** :
  - Chargement de tous les fichiers JSON à chaque appel
  - Pas de mise en cache des données de taxonomie

## Solutions Recommandées

### 1. Optimisation de l'Extraction des Mots-Clés
```typescript
// Avant
const regex = new RegExp(`\\b${escapedKeyword}\\w*\\b`, 'gi');

// Après - Utiliser un Set pour une recherche plus rapide
const keywordSet = new Set(normalizedDocKeywords);
const intersection = categoryKeywords.filter(k => keywordSet.has(k));
```

### 2. Amélioration des Performances du Scoring
- Implémenter un système de cache pour les résultats intermédiaires
- Limiter la taille du texte analysé pour le calcul des fréquences
- Utiliser des structures de données optimisées (Maps, Sets)

### 3. Optimisation du Chargement de la Taxonomie
```typescript
// Mettre en cache la taxonomie au niveau du module
let cachedTaxonomy: Category[] | null = null;

export function getCachedTaxonomy(): Category[] {
    if (!cachedTaxonomy) {
        cachedTaxonomy = loadTaxonomy();
    }
    return cachedTaxonomy;
}
```

## Actions Immédiates

1. **Activer les logs détaillés**
   - Ajouter des timers autour des sections critiques
   - Logger le nombre de mots-clés et de catégories traitées

2. **Limiter la Taille des Textes**
   - Tronquer les textes trop longs avant le traitement
   - Exemple : `const processedText = text.slice(0, 10000);`

3. **Mise en Œuvre du Cache**
   ```typescript
   // Exemple d'implémentation d'un cache simple
   const classificationCache = new Map<string, DocumentClassification>();
   
   async function getCachedClassification(input: ClassificationInput) {
       const cacheKey = `${input.documentId}-${input.language}-${input.profile}`;
       if (classificationCache.has(cacheKey)) {
           return classificationCache.get(cacheKey)!;
       }
       const result = await classifyDocument(input);
       classificationCache.set(cacheKey, result);
       return result;
   }
   ```

## Mesures de Performance à Implémenter

1. **Benchmark Initial**
   - Mesurer le temps moyen de classification par document
   - Compter le nombre de mots-clés extraits
   - Mesurer la taille de la taxonomie chargée

2. **Optimisations Progressives**
   - Appliquer les optimisations une par une
   - Mesurer l'impact après chaque changement
   - Vérifier la qualité des résultats

## Fichiers à Modifier en Priorité

1. `scorer.ts`
   - Optimiser `scoreAgainstTaxonomy`
   - Implémenter le cache des résultats

2. `keyword-extractor.ts`
   - Améliorer les performances d'extraction
   - Limiter la taille des textes

3. `taxonomy.ts`
   - Mettre en cache la taxonomie
   - Optimiser les structures de données

## Surveillance Continue
- Ajouter des métriques de performance
- Implémenter des alertes en cas de dégradation
- Surveiller l'utilisation mémoire

## Conclusion
Les problèmes de performance semblent principalement liés à la gestion des mots-clés et au calcul des scores. Les optimisations proposées devraient permettre de réduire considérablement les temps de traitement.
