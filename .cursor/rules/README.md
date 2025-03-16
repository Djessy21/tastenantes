# Cursor Rules pour Tastenantes

Ce dossier contient les règles pour l'assistant AI de Cursor dans le projet Tastenantes.

## Structure des règles

- **project.mdc** : Règles générales du projet Tastenantes
- **nextjs.mdc** : Règles spécifiques à Next.js et à l'architecture du projet
- **ui.mdc** : Règles pour le développement des composants UI et le styling
- **database.mdc** : Règles pour les opérations de base de données avec Prisma et PostgreSQL
- **code-style.mdc** : Règles pour le style de code et la syntaxe
- **performance.mdc** : Règles pour l'optimisation des performances

## Format des fichiers de règles

Chaque fichier de règles suit le format recommandé par Cursor :

```
---
description: "Description de la règle"
globs:
  - "pattern/de/fichiers/*.extension"
alwaysApply: true/false
---

# Contenu de la règle
```

- **description** : Description sémantique de la règle pour aider l'IA à choisir quand l'appliquer
- **globs** : Patterns de fichiers auxquels cette règle s'applique automatiquement
- **alwaysApply** : Si la règle doit toujours être appliquée (true) ou seulement pour les fichiers correspondants (false)

## Comment utiliser ces règles

Ces règles sont automatiquement appliquées par Cursor lorsque vous travaillez sur des fichiers correspondant aux patterns spécifiés dans chaque fichier de règles.

Vous pouvez également référencer explicitement ces règles dans vos conversations avec l'assistant AI de Cursor en utilisant la syntaxe `@Cursor Rules`.

## Mise à jour des règles

Pour mettre à jour ces règles :

1. Ouvrez Cursor
2. Allez dans les paramètres (Settings)
3. Naviguez vers General > Project Rules
4. Modifiez les fichiers de règles existants ou ajoutez-en de nouveaux

Vous pouvez également modifier directement les fichiers .mdc dans ce dossier.

## Configuration globale

En plus de ces règles spécifiques au projet, vous pouvez également définir des règles globales dans les paramètres de Cursor sous General > Rules for AI.
