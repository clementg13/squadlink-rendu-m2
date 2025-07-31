import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/stores/authStore';

export default function OnboardingCompletion() {
  const { setIsOnboarding } = useAuth();

  const handleContinue = () => {
    console.log('🎉 OnboardingCompletion: Onboarding completed, disabling onboarding mode');
    // Désactiver le mode onboarding avant de naviguer
    setIsOnboarding(false);
    
    // Petit délai pour s'assurer que le state est mis à jour
    setTimeout(() => {
      router.replace('/(protected)/(tabs)');
    }, 100);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji} importantForAccessibility="no">🎉</Text>
        <Text style={styles.title}>Bienvenue dans SquadLink !</Text>
        <Text style={styles.subtitle}>
          Votre profil est maintenant configuré
        </Text>
        
        <View style={styles.features}>
          <Text style={styles.featuresTitle}>Vous pouvez maintenant :</Text>
          
          <View style={styles.feature}>
            <Text style={styles.featureText} accessibilityLabel="Trouver des partenaires qui vous correspondent">
              🤝 Trouver des partenaires qui vous correspondent
            </Text>
          </View>
          
          <View style={styles.feature}>
            <Text style={styles.featureText} accessibilityLabel="Discuter ensemble">
              💬 Discuter ensemble
            </Text>
          </View>
          
          <View style={styles.feature}>
            <Text style={styles.featureText} accessibilityLabel="Créer des séances ensemble">
              📅 Créer des séances ensemble
            </Text>
          </View>
          
          <View style={styles.feature}>
            <Text style={styles.featureText} accessibilityLabel="Progresser ensemble">
              📈 Progresser ensemble !
            </Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.continueButton} 
        onPress={handleContinue}
        accessibilityLabel="Découvrir SquadLink"
        accessibilityHint="Appuyez pour terminer l'onboarding et accéder à l'application"
      >
        <Text style={styles.continueButtonText}>Découvrir SquadLink</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  features: {
    width: '100%',
    marginTop: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 24,
  },
  feature: {
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  featureText: {
    fontSize: 16,
    color: '#34495e',
    lineHeight: 22,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});