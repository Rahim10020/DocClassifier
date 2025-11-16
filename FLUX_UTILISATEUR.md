# Flux Utilisateur - Document Classifier

Ce document décrit le parcours complet d'un utilisateur dans l'application de classification de documents, de son arrivée jusqu'à son départ.

## 1. Arrivée sur le site

### Page d'accueil (`/`)
- L'utilisateur arrive sur une page d'accueil avec :
  - Un en-tête avec navigation et sélecteur de langue
  - Une section héro avec un message d'accueil
  - Une zone de dépôt de fichiers (drag & drop)
  - Un sélecteur de profil de classification
  - Des informations sur les fonctionnalités

### Authentification
- L'utilisateur peut se connecter via :
  - Google OAuth
  - Email/Mot de passe
  - Compte invité (si activé)
- La gestion de l'authentification est gérée par NextAuth.js

## 2. Téléchargement des documents

### Sélection des fichiers
- L'utilisateur peut :
  - Glisser-déposer des fichiers dans la zone prévue
  - Cliquer pour sélectionner des fichiers
  - Sélectionner plusieurs fichiers à la fois
- Types de fichiers supportés :
  - Documents : PDF, DOCX, DOC, TXT, etc.
  - Images : JPG, PNG, etc. (pour l'extraction de texte)

### Validation des fichiers
- Vérification de la taille maximale
- Vérification des types de fichiers
- Détection des doublons
- Affichage des erreurs si nécessaire

### Sélection du profil de classification
- L'utilisateur peut choisir un profil de classification :
  - Par défaut : classification automatique
  - Profils personnalisés selon les besoins métier
  - Chaque profil a sa propre taxonomie de catégories

## 3. Traitement des documents

### Envoi des fichiers
- Les fichiers sont envoyés au serveur via l'API `/api/upload`
- Une barre de progression affiche l'avancement
- Chaque fichier est traité séparément
- Un ID de session est créé pour regrouper les fichiers

### Extraction du texte
- Pour les PDF : extraction du texte avec PDF.js
- Pour les images : utilisation d'OCR (Tesseract.js)
- Pour les documents Office : extraction du contenu textuel
- Détection automatique de la langue

## 4. Classification automatique

### Processus de classification
1. Extraction des mots-clés du document
2. Comparaison avec la taxonomie du profil sélectionné
3. Calcul des scores de pertinence pour chaque catégorie
4. Sélection de la catégorie la plus pertinente
5. Attribution de la catégorie et des métadonnées

### Résultats de la classification
- Affichage des documents classés par catégorie
- Score de confiance pour chaque classification
- Mots-clés détectés
- Possibilité de reclasser manuellement

## 5. Gestion des documents classés

### Visualisation
- Vue par catégorie
- Vue par type de document
- Barre de recherche pour filtrer les résultats

### Actions possibles
- Téléchargement des documents un par un
- Export en masse par catégorie
- Suppression de documents
- Modification manuelle de la classification

## 6. Export des résultats

### Options d'export
- Téléchargement des documents classés dans une structure de dossiers
- Export des métadonnées au format CSV/Excel
- Génération d'un rapport de classification

### Structure des dossiers exportés
```
/export_
  /Catégorie_1
    /Sous-catégorie_A
      document1.pdf
      document2.pdf
  /Catégorie_2
    document3.pdf
  rapport_classification.xlsx
```

## 7. Gestion de session

### Données stockées
- Fichiers temporaires (24h max)
- Métadonnées de classification
- Préférences utilisateur

### Nettoyage automatique
- Suppression des fichiers après 24h
- Nettoyage des sessions expirées
- Suppression des documents après export

## 8. Sécurité et confidentialité

### Protection des données
- Chiffrement des fichiers en transit (HTTPS)
- Stockage temporaire sécurisé
- Suppression automatique des données

### Gestion des accès
- Authentification requise pour les fonctionnalités avancées
- Limitation des taux d'upload
- Journalisation des activités

## 9. Déconnexion

### Fermeture de session
- Suppression des données de session côté client
- Invalidation du token d'authentification
- Redirection vers la page d'accueil

### Données conservées
- Aucune donnée personnelle n'est conservée après déconnexion
- Les fichiers téléchargés sont conservés selon la politique de rétention

## 10. Points d'amélioration

### Prochaines fonctionnalités
- Intégration avec des services de stockage cloud
- Modèles de classification personnalisables
- API pour intégration avec d'autres applications
- Tableau de bord analytique

### Optimisations potentielles
- Traitement par lots plus efficace
- Meilleure gestion des gros volumes de documents
- Interface utilisateur plus réactive
- Support de plus de formats de fichiers

---

*Dernière mise à jour : 16/11/2025*
