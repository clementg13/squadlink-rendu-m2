# 📋 Guide du Système de Changelog Automatique

Ce guide explique comment utiliser le système de changelog automatique intégré dans le workflow de release de SquadLink.

## 🎯 Objectif

Le système génère automatiquement un changelog détaillé basé sur les commits depuis la dernière release et l'utilise comme :
- **Message du build EAS** - Description visible dans l'interface EAS
- **Historique de version** - Traçabilité des modifications

## 🔧 Fonctionnement

### 1. Génération automatique

Lors du workflow de release (push d'un tag `v*`), le système :
1. **Récupère tous les commits** depuis la dernière release
2. **Catégorise les commits** par type (features, bugs, améliorations, etc.)
3. **Génère un changelog formaté** en Markdown
4. **Utilise le changelog** comme description du build et de la release

### 2. Catégories de commits

Les commits sont automatiquement catégorisés selon les mots-clés :

| Catégorie | Mots-clés détectés | Emoji |
|-----------|-------------------|-------|
| **Nouvelles fonctionnalités** | `feat`, `feature`, `add` | ✨ |
| **Corrections de bugs** | `fix`, `bug`, `patch` | 🐛 |
| **Améliorations/Refactoring** | `refactor`, `clean`, `improve` | 🔧 |
| **Documentation** | `doc`, `readme` | 📝 |
| **Autres modifications** | Tout le reste | 📝 |

### 3. Format du changelog

```markdown
# 📋 Changelog - Release v1.2.0

**Date:** 30/07/2025 à 14:30
**Version précédente:** v1.1.0

## 📊 Résumé
- **Nombre total de commits:** 15
- **Nouvelles fonctionnalités:** 5
- **Corrections de bugs:** 3
- **Améliorations/Refactoring:** 4
- **Documentation:** 2

## ✨ Nouvelles fonctionnalités
- **feat: Add user profile completion wizard** ([a1b2c3d](url)) - *John Doe* - 2025-07-30

## 🐛 Corrections de bugs
- **fix: Resolve login issue with email validation** ([e4f5g6h](url)) - *Jane Smith* - 2025-07-29

[... etc ...]
```

## 🚀 Utilisation

### Génération manuelle

```bash
# Générer le changelog pour la version actuelle (dernier tag)
npm run release:changelog

# Générer le changelog pour une version spécifique
npm run release:changelog v1.2.0

# Ou directement avec le script
./scripts/generate-changelog.sh v1.2.0
```

### Intégration dans le workflow de release

Le changelog est automatiquement généré lors de :

1. **Finalisation de release** (`npm run release:finalize`)
   - Le script `finalize-release.sh` génère le changelog
   - Propose d'utiliser le changelog comme message de tag

2. **GitHub Actions** (sur push de tag)
   - Génère le changelog automatiquement
   - Utilise un résumé comme message de build EAS
   - Crée une GitHub Release avec le changelog complet

## 💡 Bonnes Pratiques

### 1. Messages de commit conventionnels

Pour des changelogs plus précis, utilisez des messages de commit descriptifs :

```bash
# ✅ Bon
git commit -m "feat: Add real-time messaging system"
git commit -m "fix: Resolve profile image upload bug"
git commit -m "refactor: Improve database query performance"

# ❌ Moins bon
git commit -m "update"
git commit -m "fixes"
git commit -m "changes"
```

### 2. Types de commits recommandés

| Type | Description | Exemple |
|------|-------------|---------|
| `feat` | Nouvelle fonctionnalité | `feat: Add push notifications` |
| `fix` | Correction de bug | `fix: Resolve crash on startup` |
| `refactor` | Refactoring code | `refactor: Simplify auth flow` |
| `perf` | Amélioration performance | `perf: Optimize image loading` |
| `docs` | Documentation | `docs: Update setup guide` |
| `style` | Formatage | `style: Fix indentation` |
| `test` | Tests | `test: Add unit tests for auth` |
| `chore` | Maintenance | `chore: Update dependencies` |

### 3. Workflow recommandé

1. **Développer** avec des commits descriptifs
2. **Préparer la release** : `npm run release:prepare 1.2.0`
3. **Créer la MR** avec bump de version
4. **Merger la MR** 
5. **Finaliser** : `npm run release:finalize 1.2.0`
6. **Le changelog est automatiquement** généré et utilisé

## 🔧 Configuration

### Personnalisation du script

Le script `scripts/generate-changelog.sh` peut être modifié pour :
- **Changer les catégories** de détection
- **Modifier le format** du changelog
- **Ajouter des filtres** de commits
- **Personnaliser les liens** GitHub

### Variables importantes

```bash
# Dans le script generate-changelog.sh
REPO_URL="https://github.com/clementg13/squadlink-rendu-m2"
COMMIT_URL_TEMPLATE="$REPO_URL/commit"
```

## 📁 Fichiers générés

### Fichiers temporaires
- `CHANGELOG_v1.2.0.md` - Changelog de la version spécifique
- Supprimés automatiquement après utilisation

### Artifacts GitHub Actions
- **changelog-v1.2.0** - Artifact contenant le changelog
- **Rétention** : 90 jours

## 🔍 Troubleshooting

### Problème : Changelog vide

**Cause** : Aucun commit depuis la dernière release
**Solution** : Vérifier que vous avez bien des commits à inclure

```bash
# Vérifier les commits depuis le dernier tag
git log $(git describe --tags --abbrev=0)..HEAD --oneline
```

### Problème : Catégorisation incorrecte

**Cause** : Messages de commit ne contiennent pas les mots-clés
**Solution** : Utiliser des messages de commit plus descriptifs ou modifier les filtres dans le script

### Problème : Liens cassés dans le changelog

**Cause** : URL du repository incorrecte
**Solution** : Vérifier la variable `REPO_URL` dans le script

## 📚 Exemples

### Changelog typique

Voici un exemple de changelog généré automatiquement :

```markdown
# 📋 Changelog - Release v1.3.0

**Date:** 30/07/2025 à 15:45
**Version précédente:** v1.2.0

## 📊 Résumé
- **Nombre total de commits:** 12
- **Nouvelles fonctionnalités:** 4
- **Corrections de bugs:** 2
- **Améliorations/Refactoring:** 3
- **Documentation:** 2

## ✨ Nouvelles fonctionnalités
- Add workout tracking system
- Implement group messaging

## 🐛 Corrections de bugs
- Resolve login timeout issue

---

** GitHub Release:** [Release v1.3.0](https://github.com/clementg13/squadlink-rendu-m2/releases/tag/v1.3.0)
```

### Message de build EAS

Le message de build sera automatiquement formaté comme :
```
📋 Changelog - Release v1.3.0 - 12 commits
```

## 🎉 Avantages

1. **Automatisation complète** - Plus besoin d'écrire manuellement les changelogs
2. **Traçabilité** - Chaque commit est lié et documenté
3. **Cohérence** - Format standardisé pour toutes les releases
4. **Visibilité** - Changelog visible dans EAS, GitHub et les artifacts
5. **Gain de temps** - Génération automatique à chaque release

Ce système améliore significativement la documentation des releases et la communication des changements ! 🚀
