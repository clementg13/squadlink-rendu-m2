#!/bin/bash

# Script EAS pre-build pour résoudre les problèmes de module resolution

echo "🚀 EAS Pre-build - Module Resolution Fix"
echo "======================================"

# Vérifier que nous sommes dans le bon répertoire
echo "📁 Répertoire de travail: $(pwd)"

# Créer un fichier metro.config.js forcé si problème
echo "⚙️ Vérification de metro.config.js..."
if [ ! -f metro.config.js ]; then
    echo "❌ metro.config.js manquant, création..."
    cat > metro.config.js << 'EOF'
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

// Configuration Metro standard Expo avec alias pour résolution des modules
const config = getDefaultConfig(__dirname);

// Ajouter la résolution des alias
config.resolver.alias = {
  '@': path.resolve(__dirname),
  '@/components': path.resolve(__dirname, 'components'),
  '@/constants': path.resolve(__dirname, 'constants'),
  '@/hooks': path.resolve(__dirname, 'hooks'),
  '@/lib': path.resolve(__dirname, 'lib'),
  '@/services': path.resolve(__dirname, 'services'),
  '@/stores': path.resolve(__dirname, 'stores'),
  '@/types': path.resolve(__dirname, 'types'),
  '@/utils': path.resolve(__dirname, 'utils'),
  '@/assets': path.resolve(__dirname, 'assets'),
};

module.exports = config;
EOF
fi

# Vérifier babel.config.js
echo "⚙️ Vérification de babel.config.js..."
if [ ! -f babel.config.js ]; then
    echo "❌ babel.config.js manquant, création..."
    cat > babel.config.js << 'EOF'
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Note: Removed module-resolver plugin to avoid EAS Build dependency issues
      // Module resolution is handled by metro.config.js resolver.alias instead
      [
        '@babel/plugin-transform-export-namespace-from'
      ],
    ],
  };
};
EOF
fi

# Debug: Afficher les configurations
echo "📋 Configuration Metro:"
cat metro.config.js | grep -A 15 "alias" || echo "Pas d'alias trouvé"

echo "📋 Configuration Babel:"
cat babel.config.js | grep -A 15 "alias" || echo "Pas d'alias trouvé"

# Vérifier l'existence des dossiers
echo "📁 Vérification des dossiers:"
for dir in components constants hooks lib services stores types utils assets; do
    if [ -d "$dir" ]; then
        echo "✅ $dir/ existe"
    else
        echo "❌ $dir/ manquant"
    fi
done

# Clear any potential cache
echo "🧹 Nettoyage du cache..."
rm -rf node_modules/.cache || true
rm -rf .expo || true

echo "✅ Pre-build terminé"
