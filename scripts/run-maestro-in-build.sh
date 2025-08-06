#!/bin/bash

# Script pour exécuter Maestro pendant le processus de build EAS
set -e

echo "🧪 Intégration Maestro dans le build EAS..."

# Installation de Maestro CLI si nécessaire
if ! command -v maestro &> /dev/null; then
    echo "📦 Installation de Maestro CLI..."
    curl -Ls "https://get.maestro.mobile.dev" | bash
    export PATH="$PATH":"$HOME/.maestro/bin"
fi

# Vérifier si un émulateur est déjà en cours
echo "📱 Vérification des devices..."
DEVICES=$(adb devices | grep -v "List of devices" | grep "device$" | wc -l)

if [ "$DEVICES" -eq 0 ]; then
    echo "🚀 Démarrage d'un émulateur..."
    # Créer un AVD simple
    echo "no" | avdmanager create avd -n maestro_test -k "system-images;android-30;google_apis;x86_64" --force 2>/dev/null || true
    
    # Démarrer l'émulateur
    emulator -avd maestro_test -no-window -no-audio -no-snapshot &
    
    # Attendre qu'il soit prêt
    echo "⏳ Attente de l'émulateur..."
    adb wait-for-device
    timeout 300 adb shell 'while [[ -z $(getprop sys.boot_completed) ]]; do sleep 1; done;' || echo "Timeout atteint"
fi

# Trouver l'APK debug
APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"

if [ -f "$APK_PATH" ]; then
    echo "📲 Installation de l'APK de test..."
    adb install -r "$APK_PATH"
    
    # Exécuter les tests Maestro directement
    echo "🎯 Exécution des tests Maestro..."
    maestro test .maestro/login-test.yaml .maestro/register-test.yaml || {
        echo "❌ Tests Maestro échoués!"
        exit 1
    }
    
    echo "✅ Tests Maestro réussis!"
else
    echo "⚠️ APK debug non trouvé, continuation du build..."
fi

echo "🎉 Intégration Maestro terminée!"
