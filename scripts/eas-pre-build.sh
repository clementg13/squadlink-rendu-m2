#!/bin/bash

# Script pre-build pour préparer l'environnement Maestro
set -e

echo "🚀 Préparation de l'environnement pour les tests Maestro..."

# Installation de Maestro CLI
echo "📦 Installation de Maestro CLI..."
curl -Ls "https://get.maestro.mobile.dev" | bash
export PATH="$PATH":"$HOME/.maestro/bin"

# Créer et démarrer un émulateur Android
echo "📱 Configuration de l'émulateur Android..."

# Créer un AVD si nécessaire
if ! avdmanager list avd | grep -q "test_avd"; then
    echo "Création de l'AVD..."
    echo "no" | avdmanager create avd -n test_avd -k "system-images;android-30;google_apis;x86_64" --force
fi

# Démarrer l'émulateur en arrière-plan
echo "🔄 Démarrage de l'émulateur..."
emulator -avd test_avd -no-window -no-audio -no-snapshot &

# Attendre que l'émulateur soit prêt
echo "⏳ Attente du démarrage de l'émulateur..."
adb wait-for-device
adb shell 'while [[ -z $(getprop sys.boot_completed) ]]; do sleep 1; done;'

echo "✅ Émulateur prêt pour les tests!"
