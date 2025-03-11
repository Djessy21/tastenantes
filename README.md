# Taste Nantes

Application de découverte des restaurants à Nantes.

## Configuration des environnements

Ce projet utilise trois environnements distincts :

### 1. Environnement de développement (local)

- **URL** : http://localhost:3000
- **Base de données** : Base de données locale ou de développement
- **Variables d'environnement** : Définies dans le fichier `.env.local`
- **Badge** : Badge vert "DEVELOPMENT" visible dans l'en-tête

### 2. Environnement de preview (Vercel)

- **URL** : https://tastenantes-git-preview-username.vercel.app
- **Base de données** : Base de données de prévisualisation
- **Variables d'environnement** : Définies dans Vercel avec l'override "Preview"
- **Badge** : Badge bleu "PREVIEW" visible dans l'en-tête
- **Fonctionnalités spéciales** : Bouton "Réinitialiser DB" pour vider la base de données

### 3. Environnement de production (Vercel)

- **URL** : https://tastenantes.vercel.app
- **Base de données** : Base de données de production
- **Variables d'environnement** : Définies dans Vercel pour "Production"
- **Badge** : Aucun badge visible

## Configuration sur Vercel

Pour configurer correctement les environnements sur Vercel :

1. Allez dans "Settings" > "Environment Variables"
2. Ajoutez les variables d'environnement nécessaires
3. Pour chaque variable, utilisez le bouton "Override" pour définir des valeurs différentes pour "Production" et "Preview"
4. Assurez-vous que `NEXT_PUBLIC_VERCEL_ENV` est défini sur "production" pour l'environnement de production et sur "preview" pour l'environnement de preview

### Variables d'environnement importantes

- `DATABASE_URL` : URL de la base de données (différente pour chaque environnement)
- `NEXT_PUBLIC_VERCEL_ENV` : Environnement actuel ("development", "preview" ou "production")
- `NEXTAUTH_SECRET` : Secret pour NextAuth (peut être le même pour tous les environnements)
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` : Clé API Google Maps

## Workflow de développement

1. Développez et testez localement
2. Poussez sur une branche de feature ou sur la branche `preview`
3. Vérifiez le déploiement de preview sur Vercel
4. Une fois satisfait, fusionnez dans `main` pour déployer en production

## Réinitialisation de la base de données de preview

En environnement de preview, les administrateurs ont accès à un bouton "Réinitialiser DB" qui permet de vider la base de données. Cela est utile pour tester avec un état initial propre.
