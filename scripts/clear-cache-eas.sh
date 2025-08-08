#!/bin/bash

# Script pour forcer le clear cache sur EAS Build
echo "🧹 EAS Build Clear Cache Script"
echo "==============================="

# Supprimer les dossiers de cache
echo "🗑️  Removing cache directories..."
rm -rf .expo
rm -rf node_modules/.cache
rm -rf dist

# Créer un fichier marqueur pour EAS Build
echo "📝 Creating cache clear marker..."
echo "$(date)" > .cache-cleared-$(date +%s)

echo "✅ Cache cleared successfully"
echo "📦 Ready for EAS Build"
