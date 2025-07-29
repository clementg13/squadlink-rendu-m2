#!/bin/bash

# Script pour automatiser le nouveau processus de release
# Usage: ./scripts/create-release.sh <version>
# Exemple: ./scripts/create-release.sh 1.2.0

set -e

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${GREEN}ℹ️  $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérification des arguments
if [ $# -eq 0 ]; then
    log_error "Version requise. Usage: ./scripts/create-release.sh <version>"
    log_info "Exemple: ./scripts/create-release.sh 1.2.0"
    exit 1
fi

VERSION=$1

# Validation du format de version
if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    log_error "Format de version invalide. Utilisez le format: x.y.z (ex: 1.2.0)"
    exit 1
fi

TAG_NAME="v$VERSION"

log_info "Début du processus de release pour la version $VERSION"

# Vérification que nous sommes sur la branche master
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "master" ]; then
    log_error "Vous devez être sur la branche master pour créer un release"
    exit 1
fi

# Vérification que le repository est propre
if [[ -n $(git status --porcelain) ]]; then
    log_error "Le repository a des modifications non commitées"
    exit 1
fi

# Récupération des dernières modifications
log_info "Récupération des dernières modifications..."
git fetch origin

# Vérification que master est à jour
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})

if [ $LOCAL != $REMOTE ]; then
    log_error "La branche master locale n'est pas à jour. Faites un git pull"
    exit 1
fi

# Étape 1: Vérifier si l'ancienne branche release existe et la merger sur master
if git show-ref --verify --quiet refs/remotes/origin/release; then
    log_warning "Une branche release existe déjà sur origin"
    read -p "Voulez-vous la merger sur master et la supprimer ? (y/N): " confirm
    if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
        log_info "Merge de l'ancienne branche release sur master..."
        git merge origin/release --no-ff -m "Merge release branch to master before new release $VERSION"
        git push origin master
        
        log_info "Suppression de l'ancienne branche release..."
        git push origin --delete release
    else
        log_error "Annulation du processus. Mergez manuellement la branche release existante."
        exit 1
    fi
fi

# Étape 2: Créer une nouvelle branche release depuis origin/master
log_info "Création de la nouvelle branche release depuis origin/master..."
git checkout -b release origin/master
git push origin release

log_info "✅ Nouvelle branche release créée !"
log_info "📋 Actions effectuées:"
echo "   • Ancienne branche release mergée et supprimée (si elle existait)"
echo "   • Nouvelle branche release créée depuis origin/master"
echo "   • Branche release poussée sur origin"

log_info "🔄 Prochaines étapes manuelles:"
echo "   1. Allez sur GitHub et créez une MR depuis origin/release"
echo "   2. Dans cette MR, modifiez :"
echo "      • version code (+1)"
echo "      • version name ($VERSION) dans le build.gradle (android/app/build.gradle)"
echo "      • incrémentez la version dans ios/squadlink/Info.plist"
echo "      • incrémentez la version dans app.config.js"
echo "      • incrémentez la version dans app.json"
echo "      • incrémentez la version dans package.json"
echo "   3. Une fois la MR mergée, revenez et exécutez :"
echo "      • ./scripts/finalize-release.sh $VERSION"

log_warning "📱 Le build Android se déclenchera automatiquement après le push du tag"
