#!/bin/bash

# Script de debug pour EAS Build - vérification de la résolution des modules

echo "🔍 Debug EAS Build - Module Resolution"
echo "======================================"

echo ""
echo "📁 Contenu du répertoire de travail:"
ls -la

echo ""
echo "📦 Vérification des alias dans babel.config.js:"
cat babel.config.js | grep -A 15 "alias"

echo ""
echo "⚙️ Vérification des alias dans metro.config.js:"
cat metro.config.js | grep -A 15 "alias"

echo ""
echo "📋 Vérification des chemins dans tsconfig.json:"
cat tsconfig.json | grep -A 15 "paths"

echo ""
echo "📁 Vérification de l'existence des dossiers:"
echo "- stores/ exists: $(test -d stores && echo 'YES' || echo 'NO')"
echo "- constants/ exists: $(test -d constants && echo 'YES' || echo 'NO')"
echo "- components/ exists: $(test -d components && echo 'YES' || echo 'NO')"

echo ""
echo "📄 Contenu du dossier stores/:"
ls -la stores/ || echo "Dossier stores/ non trouvé"

echo ""
echo "📄 Contenu du dossier constants/:"
ls -la constants/ || echo "Dossier constants/ non trouvé"

echo ""
echo "🔧 Variables d'environnement:"
echo "NODE_ENV: $NODE_ENV"
echo "EXPO_PUBLIC_*:"
env | grep EXPO_PUBLIC || echo "Aucune variable EXPO_PUBLIC trouvée"

echo ""
echo "📦 Packages Babel installés:"
npm list | grep babel || echo "Aucun package babel trouvé"

echo ""
echo "🏁 Debug terminé"
