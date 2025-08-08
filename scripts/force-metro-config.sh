#!/bin/bash

# Script pour forcer une configuration Metro correcte

echo "🚀 Force Metro Config Fix"
echo "========================"

# Afficher l'environnement
echo "📁 Working directory: $(pwd)"
echo "📁 Directory contents:"
ls -la

echo ""
echo "🔧 Environment variables:"
echo "NODE_ENV: $NODE_ENV"
echo "EXPO_PUBLIC_*:"
env | grep EXPO_PUBLIC || echo "None found"

# Sauvegarder l'ancien metro.config.js s'il existe
if [ -f metro.config.js ]; then
    echo "📄 Backing up existing metro.config.js"
    cp metro.config.js metro.config.js.backup
fi

# Créer un metro.config.js robuste
echo "⚙️ Creating robust metro.config.js..."
cat > metro.config.js << 'EOF'
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

// Configuration Metro ultra-robuste pour EAS Build
const config = getDefaultConfig(__dirname);

// Debug
console.log('🔧 [Metro] Loading config from:', __dirname);
console.log('🔧 [Metro] Project structure check:');
console.log('  - constants/:', require('fs').existsSync(path.join(__dirname, 'constants')));
console.log('  - stores/:', require('fs').existsSync(path.join(__dirname, 'stores')));

// S'assurer que resolver existe
if (!config.resolver) {
  config.resolver = {};
}

// Configuration des alias avec chemins absolus
const projectRoot = path.resolve(__dirname);
config.resolver.alias = {
  '@': projectRoot,
  '@/components': path.resolve(projectRoot, 'components'),
  '@/constants': path.resolve(projectRoot, 'constants'),
  '@/hooks': path.resolve(projectRoot, 'hooks'),
  '@/lib': path.resolve(projectRoot, 'lib'),
  '@/services': path.resolve(projectRoot, 'services'),
  '@/stores': path.resolve(projectRoot, 'stores'),
  '@/types': path.resolve(projectRoot, 'types'),
  '@/assets': path.resolve(projectRoot, 'assets'),
};

console.log('🔧 [Metro] Aliases configured:', Object.keys(config.resolver.alias));

// Configuration Sentry
config.transformer.minifierConfig = {
  ...config.transformer.minifierConfig,
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;
EOF

echo "✅ Metro config forcibly updated"

# Vérifier que les dossiers existent
echo ""
echo "📂 Verifying project structure:"
for dir in components constants hooks lib services stores types assets; do
    if [ -d "$dir" ]; then
        echo "✅ $dir/ exists"
    else
        echo "❌ $dir/ missing"
        echo "   Contents of current directory:"
        ls -la | grep -E "^d"
    fi
done

# Test de syntaxe
echo ""
echo "🧪 Testing metro.config.js syntax..."
node -c metro.config.js && echo "✅ Syntax OK" || echo "❌ Syntax error"

echo ""
echo "🏁 Force config complete"
