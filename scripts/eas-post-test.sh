#!/bin/bash

# Script post-test pour générer l'app-bundle de production
set -e

echo "🎯 Génération de l'app-bundle de production après tests réussis..."

# Si nous sommes arrivés ici, les tests Maestro ont réussi
echo "✅ Tests Maestro validés!"

# Générer l'app-bundle pour production
echo "📦 Construction de l'app-bundle..."
cd android
./gradlew bundleRelease

# Vérifier que l'app-bundle a été généré
if [ -f "app/build/outputs/bundle/release/app-release.aab" ]; then
    echo "✅ App-bundle généré avec succès!"
    ls -la app/build/outputs/bundle/release/
else
    echo "❌ Échec de la génération de l'app-bundle"
    exit 1
fi

echo "🎉 Build de production terminé avec tests intégrés!"
