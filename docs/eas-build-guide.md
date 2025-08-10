# ⚠️ Guide EAS - TEMPORAIREMENT SUSPENDU

> **🚨 ATTENTION** : Ce guide est **temporairement suspendu**. Le projet a migré vers un workflow **Gradle/GitHub Actions** pour Android uniquement.
> 
> **🍎 Retour prévu :** EAS sera **réutilisé pour iOS** dès l'obtention de la licence Apple Developer.
> 
> **📖 Consultez la nouvelle documentation :**
> - [Guide de Release Android](./android-release-guide.md) - Workflow Gradle actuel
> - [Guide de Migration](./migration-eas-to-gradle.md) - Explication de la migration

---

# Guide de Configuration EAS pour SquadLink (EN ATTENTE LICENCE APPLE)

Ce guide explique comment configurer et utiliser EAS (Expo Application Services) pour le build et la distribution de SquadLink.

**📱 Status actuel :**
- ❌ **Android** : Migré vers Gradle/GitHub Actions
- ⏳ **iOS** : En attente de licence Apple Developer pour réactiver EAS

## 📋 Table des matières

1. [Configuration initiale](#configuration-initiale)
2. [Secrets GitHub](#secrets-github)
3. [Commandes de build](#commandes-de-build)
4. [Workflow de release](#workflow-de-release)
5. [Troubleshooting](#troubleshooting)

## 🚀 Configuration initiale

### 1. Installation d'EAS CLI

```bash
npm install -g @expo/cli eas-cli
```

### 2. Login Expo

```bash
expo login
eas login
```

### 3. Configuration du projet

```bash
# Initialiser EAS dans le projet (si pas déjà fait)
eas build:configure

# Lier le projet à votre compte Expo
eas init --id YOUR_PROJECT_ID
```

### 4. Vérifier la configuration

```bash
# Voir les informations du projet
eas project:info

# Lister les builds
eas build:list
```

## 🔐 Secrets GitHub

Configurez ces secrets dans GitHub Actions (Settings > Secrets and variables > Actions) :

| Variable | Description | Status |
|----------|-------------|--------|
| `EXPO_TOKEN` | Token d'accès Expo pour EAS CLI | ✅ |
| `EXPO_PUBLIC_SUPABASE_URL` | URL de votre instance Supabase | ✅ |
| `EXPO_PUBLIC_SUPABASE_KEY` | Clé publique Supabase | ✅ |

### Génération du token Expo

1. **Via l'interface web (recommandé)** :
   - Aller sur [expo.dev](https://expo.dev)
   - Se connecter à votre compte
   - Aller dans **Settings** → **Access Tokens**
   - Cliquer sur **Create Token**
   - Nommer le token (ex: "GitHub Actions CI")
   - Copier le token généré

2. **Via CLI (si disponible)** :
   ```bash
   # Cette commande peut ne pas être disponible selon la version
   expo auth:token:create
   ```

⚠️ **Important** : Le token n'est affiché qu'une seule fois, sauvegardez-le immédiatement !

## 🏗️ Commandes de build

### Build local (développement)

```bash
# Android preview (APK)
npm run build:android

# iOS preview
npm run build:ios

# Android production (AAB)
npm run build:android:production

# iOS production
npm run build:ios:production

# Toutes les plateformes
npm run build:all
```

### Build avec options

```bash
# Build spécifique avec profil
eas build --platform android --profile preview

# Build avec clear cache
eas build --platform android --profile production --clear-cache

# Build local (plus rapide pour debug)
eas build --platform android --profile development --local
```

## 🔄 Workflow de release

### 1. Préparation de la release

```bash
# Créer une branche release avec bump de version
npm run release:prepare 1.2.0
```

### 2. Merge Request

- Créer une MR de `release` vers `master`
- Vérifier que les builds passent
- Merger la MR

### 3. Finalisation

```bash
# Créer le tag et déclencher le build de production
npm run release:finalize 1.2.0
```

### 4. GitHub Actions

Le workflow automatique va :
1. ✅ **Tests et lint** (ESLint + Jest)
2. ✅ **Build EAS Preview** (APK pour tests)
3. ✅ **Build EAS Production** (AAB pour Play Store)
4. 🔲 **Submit automatique** (optionnel, commenté par défaut)

## 📱 Profiles de build

### Preview Profile
- **Distribution** : Internal testing
- **Android** : APK (plus rapide à installer)
- **iOS** : Ad-hoc distribution
- **Channel** : `preview`

### Production Profile  
- **Distribution** : Store submission
- **Android** : AAB (optimisé pour Play Store)
- **iOS** : App Store distribution
- **Channel** : `production`

### Development Profile
- **Distribution** : Development builds
- **Avec** : Development client
- **Pour** : Tests locaux avec hot reload

## 📦 Distribution

### EAS Update (Over-the-Air)

```bash
# Publier une mise à jour OTA
eas update --channel preview --message "Fix urgent bug"

# Publier en production
eas update --channel production --message "New features"
```

### Download des builds

1. Aller sur [expo.dev/accounts/[username]/projects/squadlink/builds](https://expo.dev)
2. Télécharger l'APK/AAB depuis l'interface
3. Ou utiliser la CLI :

```bash
# Lister les builds récents
eas build:list --limit 10

# Télécharger un build spécifique
eas build:download [BUILD_ID]
```

## 🔧 Troubleshooting

### Erreur de build Android

```bash
# Clear cache EAS
eas build --platform android --clear-cache

# Vérifier la configuration
eas build:configure --platform android
```

### Erreur de credentials

```bash
# Reset des credentials
eas credentials --platform android

# Voir les credentials actuels
eas credentials --platform android --list
```

### Erreur de quota

- Les comptes gratuits Expo ont des limites de build
- Vérifier les quotas sur [expo.dev/accounts/[username]/settings/usage](https://expo.dev)
- Considérer un upgrade si nécessaire

### Build local pour économiser les quotas

```bash
# Build local (ne consomme pas de quota)
eas build --platform android --profile development --local

# Nécessite Android SDK installé localement
```

## 📚 Ressources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [EAS Update Documentation](https://docs.expo.dev/eas-update/introduction/)
- [Expo CLI Reference](https://docs.expo.dev/more/expo-cli/)

## ⚡ Tips

1. **Utilisez les builds preview** pour les tests rapides (APK)
2. **Build production** uniquement pour les releases officielles (AAB)
3. **EAS Update** pour les correctifs urgents sans rebuild
4. **Builds locaux** pour économiser le quota pendant le développement
5. **Channels** pour gérer différents environnements de test
