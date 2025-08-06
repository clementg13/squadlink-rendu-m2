#!/bin/bash

# Script pour exécuter les tests Maestro après le build EAS
set -e

echo "🧪 Exécution des tests Maestro post-build..."

# S'assurer que Maestro est dans le PATH
export PATH="$PATH":"$HOME/.maestro/bin"

# Vérifier que l'émulateur est toujours actif
echo "📱 Vérification du device Android..."
adb devices

# Trouver et installer l'APK généré
echo "📦 Recherche de l'APK généré..."
APK_PATH=$(find . -name "*.apk" -path "*/build/outputs/apk/*" | head -1)

if [ -n "$APK_PATH" ]; then
    echo "📲 Installation de l'APK: $APK_PATH"
    adb install -r "$APK_PATH"
else
    echo "❌ Aucun APK trouvé!"
    find . -name "*.apk" -type f
    exit 1
fi

# Exécuter les tests Maestro
echo "🎯 Lancement des tests Maestro..."
if [ -d ".maestro" ]; then
    maestro test .maestro/
    echo "✅ Tests Maestro réussis!"
else
    echo "⚠️ Dossier .maestro non trouvé"
    exit 1
fi

# Exécuter le script post-test pour générer l'app-bundle
echo "🔄 Génération de l'app-bundle de production..."
./scripts/eas-post-test.sh

echo "🎉 Build complet avec tests Maestro intégrés terminé!"
