import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { OnboardingData } from '@/types/onboarding';
import { OnboardingService } from '@/services/onboardingService';

interface OnboardingCompletionProps {
  onboardingData: OnboardingData;
}

export default function OnboardingCompletion({ onboardingData }: OnboardingCompletionProps) {
  const [isCreatingAccount, setIsCreatingAccount] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createUserAccount();
  }, []);

  const createUserAccount = async () => {
    try {
      setIsCreatingAccount(true);
      const result = await OnboardingService.createUserAndProfile(onboardingData);
      
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Une erreur est survenue');
      }
    } catch (err) {
      setError('Une erreur inattendue est survenue');
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const handleContinue = () => {
    router.replace('/(protected)/(tabs)');
  };

  if (isCreatingAccount) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingTitle}>Création de votre compte...</Text>
          <Text style={styles.loadingSubtitle}>
            Nous configurons votre profil personnalisé
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.errorEmoji}>❌</Text>
          <Text style={styles.errorTitle}>Oups ! Une erreur est survenue</Text>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
        
        <TouchableOpacity style={styles.retryButton} onPress={createUserAccount}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.successEmoji}>🎉</Text>
        <Text style={styles.successTitle}>Félicitations !</Text>
        <Text style={styles.successSubtitle}>
          Votre compte a été créé avec succès
        </Text>
        
        <View style={styles.encouragement}>
          <Text style={styles.encouragementTitle}>Vous êtes prêt(e) à :</Text>
          
          <View style={styles.feature}>
            <Text style={styles.featureEmoji}>🔍</Text>
            <Text style={styles.featureText}>Découvrir des partenaires sportifs près de chez vous</Text>
          </View>
          
          <View style={styles.feature}>
            <Text style={styles.featureEmoji}>💬</Text>
            <Text style={styles.featureText}>Échanger avec la communauté SquadLink</Text>
          </View>
          
          <View style={styles.feature}>
            <Text style={styles.featureEmoji}>📈</Text>
            <Text style={styles.featureText}>Suivre vos progrès et atteindre vos objectifs</Text>
          </View>
        </View>

        <View style={styles.tip}>
          <Text style={styles.tipTitle}>💡 Conseil</Text>
          <Text style={styles.tipText}>
            N'hésitez pas à compléter votre profil dans l'onglet "Profil" pour maximiser vos chances de trouver le partenaire idéal !
          </Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
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
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 40,
  },
  encouragement: {
    width: '100%',
    marginBottom: 30,
  },
  encouragementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  featureEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#34495e',
    lineHeight: 20,
  },
  tip: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#5a6c7d',
    lineHeight: 20,
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
  errorEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
