# 🚀 Guide de Release Android - Build Gradle avec GitHub Actions

## 📋 Vue d'ensemble

Le projet utilise maintenant un **workflow Gradle natif** avec GitHub Actions pour les releases Android, remplaçant l'ancienne solution EAS.

## 🔄 Nouvelle Architecture

Le projet utilise maintenant :
- ✅ **Build Gradle direct** (`./gradlew assembleRelease`)
- ✅ **CI/CD GitHub Actions** automatisé sur les tags
- ✅ **GitHub Releases** avec APK et changelog automatiques
- ✅ **Sentry intégré** pour les source maps et monitoring
- ✅ **Variables d'environnement sécurisées** via GitHub Secrets
- ✅ **Changelog automatique** généré à partir des commits

## 🛠 Workflow de Release

### 1. Préparation de la release
```bash
npm run release:prepare 1.2.0
```

### 2. Finalisation et push du tag
```bash
npm run release:finalize 1.2.0
```

### 3. Build automatique via GitHub Actions
Dès que le tag est poussé, GitHub Actions :
- 🔨 Build l'APK avec `./gradlew assembleRelease`
- 📄 Génère le changelog automatiquement
- 📱 Crée une GitHub Release avec l'APK
- 🐛 Upload les source maps vers Sentry (si configuré)

## 📱 Accès aux Builds

Les APK sont disponibles sur :
**[GitHub Releases](https://github.com/clementg13/squadlink-rendu-m2/releases)**

## 🔧 Build Local (optionnel)

Pour tester localement avant release :
```bash
# Build propre
npm run build:android:clean

# Build simple
npm run build:android

# Upload manuel vers GitHub
npm run release:upload <version>
```

## ⚙️ Configuration

### Variables d'environnement requises (GitHub Secrets)
- `EXPO_PUBLIC_SUPABASE_URL` - URL Supabase
- `EXPO_PUBLIC_SUPABASE_KEY` - Clé publique Supabase  
- `API_URL` - URL de votre API backend
- `SENTRY_AUTH_TOKEN` - Token Sentry (optionnel)
- `SENTRY_DSN` - DSN Sentry (optionnel)

### Fichiers de configuration
- `.github/workflows/release-android.yml` - Pipeline CI/CD
- `android/app/build.gradle` - Configuration Gradle avec Sentry conditionnel
- `scripts/generate-changelog.sh` - Générateur de changelog

## 🔍 Monitoring et Debug

### Logs de build
Consultez les logs sur : https://github.com/clementg13/squadlink-rendu-m2/actions

### Problèmes fréquents
1. **Variables manquantes** : Vérifiez les GitHub Secrets
