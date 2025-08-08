#!/bin/bash

# Script de debug pour vérifier la résolution Metro

echo "🔍 Metro Debug - Module Resolution"
echo "================================="

echo ""
echo "📁 Working Directory: $(pwd)"
echo "📁 Directory contents:"
ls -la | head -10

echo ""
echo "📄 Metro config exists: $(test -f metro.config.js && echo 'YES' || echo 'NO')"
if [ -f metro.config.js ]; then
    echo "📄 Metro config content:"
    cat metro.config.js
fi

echo ""
echo "📂 Directory structure check:"
echo "- constants/: $(test -d constants && echo 'EXISTS' || echo 'MISSING')"
echo "- stores/: $(test -d stores && echo 'EXISTS' || echo 'MISSING')"
echo "- components/: $(test -d components && echo 'EXISTS' || echo 'MISSING')"

if [ -d constants ]; then
    echo "📄 constants/ contents:"
    ls -la constants/
fi

echo ""
echo "🔧 Node.js version: $(node --version)"
echo "🔧 Expo CLI version: $(npx expo --version)"

echo ""
echo "📦 Checking metro-config package:"
npm list @expo/metro-config || echo "metro-config not found"

echo ""
echo "🏁 Debug complete"
