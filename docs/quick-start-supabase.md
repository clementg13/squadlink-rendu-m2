# Guide de démarrage rapide - Supabase

Ce guide vous aide à configurer rapidement Supabase dans votre projet SquadLink.

## Prérequis

- Node.js installé
- Compte Supabase (gratuit sur [supabase.com](https://supabase.com))

## 1. Configuration Supabase

### Créer un projet Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un compte ou se connecter
3. Cliquer sur "New Project"
4. Remplir les informations :
   - **Name** : `squadlink` (ou votre nom préféré)
   - **Database Password** : Choisir un mot de passe fort
   - **Region** : Choisir la région la plus proche
5. Cliquer sur "Create new project"

### Récupérer les clés API

1. Dans le dashboard Supabase, aller dans **Settings** > **API**
2. Copier :
   - **Project URL** : `https://your-project.supabase.co`
   - **Anon public key** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 2. Configuration locale

### Créer le fichier .env

Créer un fichier `.env` à la racine du projet :

```bash
cp .env.example .env  # Si le fichier exemple existe
# ou créer manuellement
```

### Remplir les variables

Ajouter dans le fichier `.env` :

```env
# Configuration Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-anon-key

# Autres variables existantes
API_URL=https://api.example.com
DEBUG=true
LOG_LEVEL=info
NODE_ENV=development
```

**⚠️ Important** : Remplacer `your-project` et `your-anon-key` par vos vraies valeurs.

## 3. Configuration de l'authentification

### Activer l'authentification par email

1. Dans Supabase, aller dans **Authentication** > **Settings**
2. Vérifier que **Enable email confirmations** est activé
3. Pour les tests, vous pouvez désactiver temporairement la confirmation email

### Configurer les URLs (optionnel)

Si vous voulez personnaliser les URLs de redirection :

1. Dans **Authentication** > **Settings**
2. Configurer **Site URL** : `exp://localhost:19000` (pour développement)
3. Ajouter des **Redirect URLs** si nécessaire

## 4. Démarrage de l'application

### Installer les dépendances

```bash
npm install
```

### Démarrer l'application

```bash
npx expo start --clear
```

### Tester l'authentification

1. Ouvrir l'application sur votre appareil/simulateur
2. Essayer de créer un compte avec votre email
3. Vérifier l'email de confirmation (si activé)
4. Tester la connexion

## 5. Vérification

### Vérifier les utilisateurs

1. Dans Supabase, aller dans **Authentication** > **Users**
2. Vous devriez voir les utilisateurs créés

### Vérifier les logs

1. Dans l'application, ouvrir les logs de développement
2. Vérifier qu'il n'y a pas d'erreurs Supabase

## Dépannage rapide

### Erreur "Property 'structuredClone' doesn't exist"

- **Problème** : React Native ne supporte pas `structuredClone` requis par Supabase
- **Solution** : Un polyfill a été automatiquement implémenté dans le projet
- **Vérification** : Redémarrer l'application avec `npx expo start --clear`

### Erreur "Invalid API key"

- Vérifier que `EXPO_PUBLIC_SUPABASE_KEY` est correct
- Vérifier qu'il n'y a pas d'espaces avant/après

### Erreur "Invalid URL"

- Vérifier que `EXPO_PUBLIC_SUPABASE_URL` est correct
- Vérifier le format : `https://your-project.supabase.co`

### Variables non trouvées

- Vérifier que le fichier `.env` est à la racine
- Redémarrer Expo : `npx expo start --clear`
- Vérifier que les variables commencent par `EXPO_PUBLIC_`

### Problèmes de connexion

- Vérifier la configuration d'authentification dans Supabase
- Vérifier les logs dans la console
- Essayer de désactiver la confirmation email pour les tests

## Prochaines étapes

Une fois l'authentification fonctionnelle :

1. Lire la [documentation complète](./supabase-implementation.md)
2. Configurer la base de données
3. Ajouter des fonctionnalités avancées
4. Déployer en production

## Support

- [Documentation Supabase](https://supabase.com/docs)
- [Guide d'authentification](https://supabase.com/docs/guides/auth)
- [Communauté Supabase](https://github.com/supabase/supabase/discussions) 