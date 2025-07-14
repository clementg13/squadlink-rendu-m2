# Configuration des Variables d'Environnement

Ce document explique comment utiliser et configurer le système de variables d'environnement dans l'application SquadLink.

## Vue d'ensemble

Le système utilise :
- **Zod** : Pour la validation de type et la vérification des variables
- **Expo Constants** : Pour accéder aux variables d'environnement dans l'application

## Architecture

### Fichiers concernés
- `constants/Environment.ts` : Configuration et validation des variables
- `.env` : Définition des variables d'environnement (non commité sur Git)
- `app.config.js` : Configuration Expo qui charge les variables depuis .env
- `.env.example` : Template des variables d'environnement

## Configuration

### 1. Définir les variables dans .env

Les variables d'environnement sont définies dans le fichier `.env` :

```env
# Variables d'environnement pour SquadLink
# ⚠️ Ce fichier ne doit JAMAIS être commité sur Git

# API Configuration
API_URL=https://api.example.com

# Debug et Logs
DEBUG=true
LOG_LEVEL=info

# Environnement
NODE_ENV=development

# Services externes (optionnels)
# SENTRY_DSN=https://your-sentry-dsn.ingest.sentry.io/project-id
# ANALYTICS_KEY=your-analytics-key
```

**Important :** Le fichier `.env` est dans le `.gitignore` et ne doit jamais être commité sur Git.

### 2. Ajouter de nouvelles variables

Pour ajouter une nouvelle variable :

1. **Modifier le schéma** dans `constants/Environment.ts` :
```typescript
const envSchema = z.object({
  // Variables existantes...
  
  // Nouvelle variable requise
  NEW_REQUIRED_VAR: z.string(),
  
  // Nouvelle variable optionnelle
  NEW_OPTIONAL_VAR: z.string().optional(),
  
  // Nouvelle variable avec valeur par défaut
  NEW_DEFAULT_VAR: z.string().default('valeur_par_defaut'),
});
```

2. **Ajouter la valeur** dans `.env` :
```env
# Nouvelles variables
NEW_REQUIRED_VAR=ma_valeur
NEW_OPTIONAL_VAR=ma_valeur_optionnelle
NEW_DEFAULT_VAR=ma_valeur_personnalisee
```

3. **Ajouter la variable** dans `app.config.js` :
```javascript
extra: {
  // Variables existantes...
  NEW_REQUIRED_VAR: process.env.NEW_REQUIRED_VAR,
  NEW_OPTIONAL_VAR: process.env.NEW_OPTIONAL_VAR,
  NEW_DEFAULT_VAR: process.env.NEW_DEFAULT_VAR,
}
```

## Utilisation

### Import des variables

```typescript
import { env, isDevelopment, isProduction } from '@/constants/Environment';

// Utilisation des variables
console.log(env.API_URL); // https://api.example.com
console.log(env.DEBUG); // true (boolean)
console.log(env.LOG_LEVEL); // 'info'

// Utilisation des helpers
if (isDevelopment) {
  console.log('Mode développement');
}
```

### Types TypeScript

Le type `Environment` est automatiquement généré depuis le schéma Zod :

```typescript
import type { Environment } from '@/constants/Environment';

function useApiUrl(): string {
  return env.API_URL; // TypeScript connaît le type
}
```

## Variables prédéfinies

| Variable | Type | Requis | Défaut | Description |
|----------|------|--------|--------|-------------|
| `API_URL` | `string` (URL) | ✅ | - | URL de l'API backend |
| `DEBUG` | `boolean` | ❌ | `false` | Active le mode debug |
| `LOG_LEVEL` | `'error' \| 'warn' \| 'info' \| 'debug'` | ❌ | `'info'` | Niveau de log |
| `NODE_ENV` | `'development' \| 'staging' \| 'production'` | ❌ | `'development'` | Environnement d'exécution |
| `SENTRY_DSN` | `string` | ❌ | - | Configuration Sentry |
| `ANALYTICS_KEY` | `string` | ❌ | - | Clé d'analytics |

## Validation et gestion d'erreurs

Le système valide automatiquement les variables au démarrage de l'application :

```typescript
// Si une variable requise est manquante ou invalide
// Une erreur sera levée avec un message détaillé :
// "Variables d'environnement invalides:
// API_URL: API_URL doit être une URL valide"
```

## Environnements multiples

### Développement local
1. Copier `.env.example` vers `.env` : `cp .env.example .env`
2. Modifier les valeurs dans `.env` selon vos besoins
3. Redémarrer Expo : `npx expo start --clear`

### Staging/Production
1. Utiliser les variables d'environnement du système de déploiement
2. Le fichier `app.config.js` les chargera automatiquement depuis `process.env`
3. Ou créer des fichiers `.env.staging` et `.env.production` spécifiques

## Bonnes pratiques

1. **Variables sensibles** : Ne jamais commiter de clés API ou secrets - utiliser `.env` (dans `.gitignore`)
2. **Validation stricte** : Toujours définir un schéma Zod pour chaque variable
3. **Valeurs par défaut** : Utiliser des valeurs par défaut raisonnables pour les variables optionnelles
4. **Types spécifiques** : Utiliser des types Zod précis (URL, enum, etc.) plutôt que des strings génériques
5. **Documentation** : Documenter chaque variable dans ce fichier

## Dépannage

### Erreur "Variables d'environnement invalides"
1. Vérifier que toutes les variables requises sont définies dans `.env`
2. Vérifier que les types correspondent au schéma Zod
3. Vérifier la syntaxe du fichier `.env`
4. Vérifier que la variable est ajoutée dans `app.config.js`

### Variable non accessible
1. Vérifier que la variable est dans le fichier `.env`
2. Vérifier qu'elle est ajoutée dans `app.config.js` dans la section `extra`
3. Redémarrer le serveur Expo après modification : `npx expo start --clear`
4. Vérifier l'import depuis `constants/Environment`

### Fichier .env non trouvé
1. Copier `.env.example` vers `.env` : `cp .env.example .env`
2. S'assurer que le fichier `.env` est à la racine du projet

## Exemple complet

```typescript
// constants/Environment.ts - Ajouter une nouvelle variable
const envSchema = z.object({
  // ... autres variables
  DATABASE_URL: z.string().url('DATABASE_URL doit être une URL valide'),
});
```

```env
# .env - Définir la valeur
DATABASE_URL=https://db.example.com
```

```javascript
// app.config.js - Exposer la variable
extra: {
  // ... autres variables
  DATABASE_URL: process.env.DATABASE_URL,
}
```

```typescript
// Utilisation dans l'app
import { env } from '@/constants/Environment';

async function connectToDatabase() {
  const connection = await connect(env.DATABASE_URL);
  return connection;
}
```

## Installation pour un nouveau développeur

1. Cloner le projet
2. Installer les dépendances : `npm install`
3. Copier le template : `cp .env.example .env`
4. Modifier les valeurs dans `.env` selon vos besoins
5. Démarrer l'application : `npx expo start` 