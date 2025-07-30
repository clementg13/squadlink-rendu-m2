# Correction des références de branche : main → master

## 📝 Fichiers modifiés

Tous les fichiers mentionnant la branche "main" ont été corrigés pour utiliser "master" :

### 🔧 Scripts
- `scripts/finalize-release.sh` : 
  - Messages et commandes de retour sur la branche master
  - Variables `back_to_master` au lieu de `back_to_main`

### 📚 Documentation
- `docs/eas-build-guide.md` :
  - Workflow de release : MR de `release` vers `master`
  
- `docs/android-release-guide.md` :
  - Schéma des branches
  - Instructions de préparation depuis master
  - Cycle de vie des branches release
  - Séparation claire master/release

### ⚙️ GitHub Actions
- `.github/workflows/eas-preview.yml` :
  - Déclenchement sur `master` et `release` seulement
  
- `.github/workflows/ci.yml` :
  - Suppression de la référence à `main`, garde seulement `master`

## ✅ Vérification

- ✅ Script `create-release.sh` utilisait déjà `master` correctement
- ✅ Aucune référence à `main` restante dans le contexte Git
- ✅ Cohérence avec la branche principale du repository : `master`

## 🚀 Impact

Les workflows et scripts fonctionnent maintenant correctement avec la branche principale `master` du repository `squadlink-rendu-m2`.
