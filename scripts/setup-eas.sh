#!/bin/bash

# Script de configuration initiale EAS pour SquadLink
# Usage: ./scripts/setup-eas.sh

set -e

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

log_step() {
    echo -e "${BLUE}🔧 $1${NC}"
}

log_info "🚀 Configuration EAS pour SquadLink"

# Vérification des prérequis
log_step "Vérification des prérequis..."

if ! command -v npm &> /dev/null; then
    log_error "npm n'est pas installé"
    exit 1
fi

# Installation des CLI nécessaires
log_step "Installation des CLI Expo et EAS..."
npm install -g @expo/cli eas-cli

# Vérification de l'installation
log_step "Vérification des installations..."
expo --version
eas --version

# Login Expo
log_step "Connexion à Expo..."
log_warning "Vous allez être redirigé vers votre navigateur pour vous connecter"
expo login

# Vérification de la connexion
log_step "Vérification de la connexion..."
expo whoami

# Configuration EAS
log_step "Configuration du projet EAS..."
if [ ! -f "eas.json" ]; then
    log_info "Le fichier eas.json existe déjà"
else
    log_warning "Configuration EAS déjà existante"
fi

# Génération du token pour CI/CD
log_step "Configuration du token d'accès pour CI/CD..."
log_warning "Pour créer un token d'accès :"
echo "   1. Aller sur https://expo.dev"
echo "   2. Se connecter à votre compte"
echo "   3. Aller dans Settings → Access Tokens"
echo "   4. Cliquer sur 'Create Token'"
echo "   5. Nommer le token 'GitHub Actions CI'"
echo "   6. Copier le token généré"
log_info "Secret GitHub à configurer : EXPO_TOKEN"

# Affichage des informations du projet
log_step "Informations du projet..."
if eas project:info 2>/dev/null; then
    log_info "Projet EAS configuré avec succès"
else
    log_warning "Le projet n'est pas encore lié à EAS"
    log_info "Exécutez 'eas init' pour lier le projet à votre compte"
fi

log_info "✅ Configuration EAS terminée !"
log_info "📚 Consultez le guide : docs/eas-build-guide.md"
log_info "🔧 Prochaines étapes :"
echo "   1. Créer un token : expo auth:token:create"
echo "   2. Ajouter EXPO_TOKEN dans les secrets GitHub"
echo "   3. Lancer votre premier build : npm run build:android"
