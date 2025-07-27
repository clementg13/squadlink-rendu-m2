#!/bin/bash

# Script pour finaliser le release (création du tag)
# Usage: ./scripts/finalize-release.sh <version>
# Exemple: ./scripts/finalize-release.sh 1.2.0

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
    log_error "Version requise. Usage: ./scripts/finalize-release.sh <version>"
    log_info "Exemple: ./scripts/finalize-release.sh 1.2.0"
    exit 1
fi

VERSION=$1

# Validation du format de version
if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    log_error "Format de version invalide. Utilisez le format: x.y.z (ex: 1.2.0)"
    exit 1
fi

TAG_NAME="v$VERSION"

log_info "Finalisation du release pour la version $VERSION"

# Vérification que nous sommes sur la branche release
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "release" ]; then
    log_warning "Vous n'êtes pas sur la branche release. Basculement..."
    git checkout release
fi

# Vérification que le repository est propre
if [[ -n $(git status --porcelain) ]]; then
    log_error "Le repository a des modifications non commitées"
    exit 1
fi

# Récupération des dernières modifications
log_info "Récupération des dernières modifications de release..."
git fetch origin
git pull origin release

# Vérification que le tag n'existe pas déjà
if git rev-parse "$TAG_NAME" >/dev/null 2>&1; then
    log_error "Le tag $TAG_NAME existe déjà"
    exit 1
fi

# Vérification que les fichiers Android ont bien été modifiés
log_info "Vérification des modifications dans build.gradle..."
if ! git log --oneline -10 | grep -i "version\|release" > /dev/null; then
    log_warning "Aucun commit récent ne semble concerner la version. Êtes-vous sûr que la MR a été mergée ?"
    read -p "Continuer quand même ? (y/N): " confirm
    if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
        log_error "Arrêt du processus"
        exit 1
    fi
fi

# Création du tag
log_info "Création du tag $TAG_NAME..."
git tag -a "$TAG_NAME" -m "Release $VERSION"

# Push du tag
log_info "Push du tag $TAG_NAME..."
git push origin "$TAG_NAME"

log_info "✅ Release $VERSION finalisée avec succès!"
log_info "📋 Actions effectuées:"
echo "   • Tag $TAG_NAME créé sur la branche release"
echo "   • Tag poussé sur origin"
log_info "🚀 Le build Android va démarrer automatiquement via GitHub Actions"
log_warning "📱 Surveillez l'onglet Actions de GitHub pour voir le progrès du build"

# Optionnel: retour sur main
read -p "Voulez-vous retourner sur la branche main ? (Y/n): " back_to_main
if [[ $back_to_main != [nN] && $back_to_main != [nN][oO] ]]; then
    git checkout main
    log_info "🔄 Retour sur la branche main"
fi
