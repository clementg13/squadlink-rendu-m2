# 🚀 Guide de Release Android - Nouveau Processus

Ce guide explique le nouveau processus de release rigoureux pour l'application Android SquadLink.

## 📋 Processus de Release en 3 Étapes

### 🔄 Workflow Complet

1. **Préparation** : Gestion des branches et création de la branche release
2. **Modification** : MR pour incrémenter version code et modifier version name  
3. **Finalisation** : Création du tag et déclenchement du build automatique

## 🛠️ Étapes Détaillées

### Étape 1 : Préparation de la Release

**Depuis la branche `main` :**

```bash
# Préparer la release (automatise la gestion des branches)
npm run release:prepare 1.2.0
```

**Ce script fait automatiquement :**
- ✅ Vérifie que vous êtes sur `main` et à jour
- ✅ Merge l'ancienne branche `release` sur `main` (si elle existe)
- ✅ Supprime l'ancienne branche `release`
- ✅ Crée une nouvelle branche `release` depuis `origin/main`
- ✅ Pousse la nouvelle branche `release` sur origin

### Étape 2 : Modification des Versions (MR Manuelle)

**Sur GitHub :**

1. **Créer une MR** depuis `origin/release`
2. **Modifier les fichiers Android** dans cette MR :

   **Dans `android/app/build.gradle` :**
   ```gradle
   android {
       defaultConfig {
           versionCode 23        // ← Incrémenter de +1
           versionName "1.2.0"   // ← Nouvelle version
       }
   }
   ```

   **Dans `package.json` (optionnel) :**
   ```json
   {
     "version": "1.2.0"
   }
   ```

3. **Merger la MR** une fois les modifications validées

### Étape 3 : Finalisation et Tag

**Après merge de la MR :**

```bash
# Finaliser la release (crée le tag et déclenche le build)
npm run release:finalize 1.2.0
```

**Ce script fait automatiquement :**
- ✅ Bascule sur la branche `release`
- ✅ Récupère les dernières modifications
- ✅ Crée le tag `v1.2.0`
- ✅ Pousse le tag sur origin
- 🚀 **Déclenche automatiquement le workflow GitHub Actions**

## ⚙️ Workflow GitHub Actions

**Déclencheur :**
```yaml
on:
  push:
    tags:
      - 'v*'
```

**Actions automatiques :**
1. ✅ **Lint & Tests** (`npm run lint:check` + `npm test`)
2. ✅ **Build AAB** (`./gradlew bundleRelease`)
3. ✅ **Distribution Firebase** (vers les testeurs)

## 📋 Récapitulatif des Commandes

### Commandes Principales
```bash
# Aide complète
npm run release:help

# Étape 1: Préparer (depuis main)
npm run release:prepare 1.2.0

# Étape 2: MR manuelle sur GitHub

# Étape 3: Finaliser (depuis release ou n'importe où)
npm run release:finalize 1.2.0
```

### Commandes de Build Local
```bash
# Build debug local
npm run build:android:debug

# Build release local  
npm run build:android

# Nettoyage
npm run build:clean
```

## 🏷️ Gestion des Branches

### Structure des Branches
```
main (développement principal)
  ↓
release (créée pour chaque release)
  ↓  
tag v1.2.0 (déclenche le build)
```

### Cycle de Vie d'une Branche Release
1. **Création** : Nouvelle branche `release` depuis `main`
2. **Modification** : MR avec version code/name
3. **Tag** : Création du tag sur `release`
4. **Merge retour** : Lors de la prochaine release, `release` est mergée dans `main`

## 🔧 Configuration Requise

### Secrets GitHub Actions
Dans GitHub → Settings → Secrets and variables → Actions :

| Secret | Description | Requis |
|--------|-------------|---------|
| `EXPO_PUBLIC_SUPABASE_URL` | URL de votre projet Supabase | ✅ |
| `EXPO_PUBLIC_SUPABASE_KEY` | Clé publique Supabase | ✅ |
| `FIREBASE_APP_ID` | ID de l'app Firebase | ✅ |
| `FIREBASE_TOKEN` | Token Firebase CLI | ✅ |

### Format des Versions

**Tags :** `v1.2.0`, `v2.0.1`, etc.
**Version Code :** Incrémental (22, 23, 24...)
**Version Name :** Semantic versioning (1.2.0, 2.0.1...)

## � Avantages du Nouveau Processus

### ✅ **Avantages**
- **Contrôle rigoureux** : Chaque release passe par une MR
- **Traçabilité** : Historique clair des versions dans Android
- **Séparation claire** : `main` pour dev, `release` pour production
- **Rollback facile** : Branches et tags séparés
- **Review des versions** : Validation par l'équipe via MR

### 🔍 **Sécurité**
- **Validation manuelle** des version code/name
- **Review obligatoire** via MR
- **Tests automatiques** avant build
- **Branches protégées** possibles

## � Monitoring

### GitHub Actions
Surveillez le build : `https://github.com/clementg13/squadlink-rendu-m2/actions`

### Firebase App Distribution
Les testeurs recevront automatiquement la notification de nouvelle version.

## 🚨 Dépannage

### "Branche release existe déjà"
Le script vous demandera si vous voulez la merger et la supprimer automatiquement.

### "Tag existe déjà"
Vérifiez que vous n'avez pas déjà créé ce tag : `git tag -l`

### "MR pas encore mergée"
Le script `finalize-release.sh` vous avertira si aucun commit récent ne concerne la version.
