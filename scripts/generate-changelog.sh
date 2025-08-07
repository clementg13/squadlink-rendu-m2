#!/bin/bash

# Script pour générer un changelog depuis la dernière release
# Usage: ./scripts/generate-changelog.sh [version]
# Si aucune version n'est fournie, utilise le dernier tag

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

log_debug() {
    echo -e "${BLUE}🔍 $1${NC}"
}

# Fonction pour générer le changelog
generate_changelog() {
    local current_version=$1
    local previous_version=$2
    local output_file=$3
    local use_head=${4:-false}
    
    if [ "$use_head" = true ]; then
        log_info "Génération du changelog depuis HEAD vers $previous_version"
        header_version="HEAD (unreleased)"
        commit_range="${previous_version}..HEAD"
    else
        log_info "Génération du changelog depuis $previous_version vers $current_version"
        header_version="$current_version"
        if [ "$previous_version" != "initial" ]; then
            commit_range="${previous_version}..${current_version}"
        else
            commit_range="--all"
        fi
    fi
    
    # En-tête du changelog
    echo "# 📋 Changelog - Release $header_version" > "$output_file"
    echo "" >> "$output_file"
    echo "**Date:** $(date '+%d/%m/%Y à %H:%M')" >> "$output_file"
    echo "**Version précédente:** $previous_version" >> "$output_file"
    echo "" >> "$output_file"
    
    # Récupérer les commits
    if [ "$previous_version" != "initial" ]; then
        log_debug "Récupération des commits avec range: $commit_range"
        if [ "$use_head" = true ]; then
            commits=$(git log --pretty=format:"%h|%s|%an|%ad" --date=short ${previous_version}..HEAD)
        else
            commits=$(git log --pretty=format:"%h|%s|%an|%ad" --date=short ${previous_version}..${current_version})
        fi
    else
        log_debug "Première release - récupération de tous les commits..."
        if [ "$use_head" = true ]; then
            commits=$(git log --pretty=format:"%h|%s|%an|%ad" --date=short)
        else
            commits=$(git log --pretty=format:"%h|%s|%an|%ad" --date=short ${current_version})
        fi
    fi
    
    if [ -z "$commits" ]; then
        echo "ℹ️  **Aucun nouveau commit depuis la dernière release**" >> "$output_file"
        return
    fi
    
    # Compter les commits
    commit_count=$(echo "$commits" | wc -l | tr -d ' ')
    echo "## 📊 Résumé" >> "$output_file"
    echo "" >> "$output_file"
    echo "- **Nombre total de commits:** $commit_count" >> "$output_file"
    
    # Analyser les types de commits
    features=$(echo "$commits" | grep -i "feat\|feature\|add" | wc -l | tr -d ' ')
    fixes=$(echo "$commits" | grep -i "fix\|bug\|patch" | wc -l | tr -d ' ')
    refactor=$(echo "$commits" | grep -i "refactor\|clean\|improve" | wc -l | tr -d ' ')
    docs=$(echo "$commits" | grep -i "doc\|readme" | wc -l | tr -d ' ')
    
    echo "- **Nouvelles fonctionnalités:** $features" >> "$output_file"
    echo "- **Corrections de bugs:** $fixes" >> "$output_file"
    echo "- **Améliorations/Refactoring:** $refactor" >> "$output_file"
    echo "- **Documentation:** $docs" >> "$output_file"
    echo "" >> "$output_file"
    
    # Section des nouveautés (features)
    if [ "$features" -gt 0 ]; then
        echo "## ✨ Nouvelles fonctionnalités" >> "$output_file"
        echo "" >> "$output_file"
        echo "$commits" | grep -i "feat\|feature\|add" | while IFS='|' read -r hash subject author date; do
            echo "- $subject" >> "$output_file"
        done
        echo "" >> "$output_file"
    fi
    
    # Section des corrections
    if [ "$fixes" -gt 0 ]; then
        echo "## 🐛 Corrections de bugs" >> "$output_file"
        echo "" >> "$output_file"
        echo "$commits" | grep -i "fix\|bug\|patch" | while IFS='|' read -r hash subject author date; do
            echo "- $subject" >> "$output_file"
        done
        echo "" >> "$output_file"
    fi
    
    # Section des améliorations
    if [ "$refactor" -gt 0 ]; then
        echo "## 🔧 Améliorations et refactoring" >> "$output_file"
        echo "" >> "$output_file"
        echo "$commits" | grep -i "refactor\|clean\|improve" | while IFS='|' read -r hash subject author date; do
            echo "- $subject" >> "$output_file"
        done
        echo "" >> "$output_file"
    fi
    
    # Section des autres commits
    other_commits=$(echo "$commits" | grep -v -i "feat\|feature\|add\|fix\|bug\|patch\|refactor\|clean\|improve\|doc\|readme")
    if [ -n "$other_commits" ]; then
        echo "## 📝 Autres modifications" >> "$output_file"
        echo "" >> "$output_file"
        echo "$other_commits" | while IFS='|' read -r hash subject author date; do
            echo "- $subject" >> "$output_file"
        done
        echo "" >> "$output_file"
    fi
    
    # Footer
    echo "---" >> "$output_file"
    echo "" >> "$output_file"
    echo "**📱 Build disponible sur:** [EAS Builds](https://expo.dev/accounts/yohanm/projects/squadlink/builds)" >> "$output_file"
    echo "**🔗 GitHub Release:** [Release $current_version](https://github.com/clementg13/squadlink-rendu-m2/releases/tag/$current_version)" >> "$output_file"
}

# Script principal
main() {
    # Récupérer la version actuelle
    if [ $# -eq 0 ]; then
        # Récupérer le dernier tag selon l'ordre des versions
        current_version=$(git tag -l "v*" --sort=-version:refname | head -1)
        if [ -z "$current_version" ]; then
            log_error "Aucun tag trouvé et aucune version fournie"
            log_info "Usage: ./scripts/generate-changelog.sh [version]"
            exit 1
        fi
        
        # Vérifier s'il y a des commits après ce tag
        latest_tag_commit=$(git rev-list -n 1 "$current_version")
        head_commit=$(git rev-parse HEAD)
        
        if [ "$latest_tag_commit" = "$head_commit" ]; then
            log_info "HEAD est exactement sur le tag $current_version"
            use_head=false
        else
            # Vérifier si HEAD est un ancêtre du tag (HEAD est derrière le tag)
            if git merge-base --is-ancestor HEAD "$current_version"; then
                ahead_count=$(git rev-list --count HEAD.."$current_version")
                if [ "$ahead_count" -gt 0 ]; then
                    log_warning "HEAD est derrière le dernier tag ($current_version) de $ahead_count commits"
                    log_info "Le changelog sera généré pour le tag existant $current_version"
                    use_head=false
                else
                    log_info "HEAD est sur le même commit que le tag $current_version"
                    use_head=false
                fi
            else
                # HEAD est en avance ou sur une branche différente
                behind_count=$(git rev-list --count "$current_version"..HEAD)
                if [ "$behind_count" -gt 0 ]; then
                    log_warning "Il y a $behind_count commits après le dernier tag ($current_version)"
                    log_warning "Le changelog sera généré depuis HEAD jusqu'au tag précédent"
                    use_head=true
                else
                    log_info "HEAD et le tag $current_version sont sur la même position"
                    use_head=false
                fi
            fi
        fi
    else
        current_version=$1
        # Ajouter le préfixe 'v' si nécessaire
        if [[ ! "$current_version" =~ ^v ]]; then
            current_version="v$current_version"
        fi
        use_head=false
    fi
    
    log_info "Génération du changelog pour la version: $current_version"
    
    # Récupérer les tags existants triés par version
    tags=$(git tag -l "v*" --sort=-version:refname)
    
    # Trouver la version précédente
    previous_version=""
    
    if [ "$use_head" = true ]; then
        # On génère depuis HEAD, donc la version précédente est le dernier tag
        previous_version=$current_version
        log_info "Génération depuis HEAD jusqu'au tag: $previous_version"
        # Fichier de sortie avec timestamp pour éviter les conflits
        timestamp=$(date +%Y%m%d_%H%M%S)
        output_file="CHANGELOG_HEAD_${timestamp}.md"
    else
        # Logique normale pour trouver la version précédente
        found_current=false
        
        for tag in $tags; do
            if [ "$found_current" = true ]; then
                previous_version=$tag
                break
            fi
            if [ "$tag" = "$current_version" ]; then
                found_current=true
            fi
        done
        
        if [ -z "$previous_version" ]; then
            previous_version="initial"
            log_warning "Aucune version précédente trouvée - première release"
        else
            log_info "Version précédente trouvée: $previous_version"
        fi
        
        # Fichier de sortie
        output_file="CHANGELOG_${current_version}.md"
    fi
    
    # Générer le changelog
    generate_changelog "$current_version" "$previous_version" "$output_file" "$use_head"
    
    log_info "✅ Changelog généré: $output_file"
    
    # Afficher un aperçu
    echo ""
    log_info "📋 Aperçu du changelog:"
    echo "----------------------------------------"
    head -20 "$output_file"
    if [ $(wc -l < "$output_file") -gt 20 ]; then
        echo "..."
        echo "(voir $output_file pour le contenu complet)"
    fi
    echo "----------------------------------------"
    
    # Option pour afficher le changelog complet (seulement en mode interactif)
    if [ -z "${CI}" ] && [ -t 0 ]; then
        echo ""
        read -p "Voulez-vous afficher le changelog complet ? (y/N): " show_full
        if [[ $show_full == [yY] || $show_full == [yY][eE][sS] ]]; then
            echo ""
            cat "$output_file"
        fi
    else
        # En mode CI, on affiche toujours un résumé plus détaillé
        echo ""
        log_info "🤖 Mode CI détecté - aperçu étendu du changelog:"
        echo "----------------------------------------"
        head -30 "$output_file"
        if [ $(wc -l < "$output_file") -gt 30 ]; then
            echo "..."
            echo "(voir $output_file pour le contenu complet)"
        fi
        echo "----------------------------------------"
    fi
}

# Vérification que nous sommes dans un repo git
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    log_error "Ce script doit être exécuté dans un repository git"
    exit 1
fi

# Exécuter le script principal
main "$@"
