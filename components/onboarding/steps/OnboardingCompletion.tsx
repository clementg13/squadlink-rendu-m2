import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function OnboardingCompletion() {
  const handleContinue = () => {
    router.replace('/(protected)/(tabs)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>Bienvenue dans SquadLink !</Text>
        <Text style={styles.subtitle}>
          Votre profil est maintenant configuré
        </Text>
        
        <View style={styles.features}>
          <Text style={styles.featuresTitle}>Vous pouvez maintenant :</Text>
          
          <View style={styles.feature}>
            <Text style={styles.featureEmoji}>🤝</Text>
            <Text style={styles.featureText}>Trouver des partenaires qui vous correspondent</Text>
          </View>
          
          <View style={styles.feature}>
            <Text style={styles.featureEmoji}>💬</Text>
            <Text style={styles.featureText}>Discuter ensemble</Text>
          </View>
          
          <View style={styles.feature}>
            <Text style={styles.featureEmoji}>📅</Text>
            <Text style={styles.featureText}>Créer des séances ensemble</Text>
          </View>
          
          <View style={styles.feature}>
            <Text style={styles.featureEmoji}>📈</Text>
            <Text style={styles.featureText}>Progresser ensemble !</Text>
          </View>
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
    marginBottom: 40,
  },
  features: {
    width: '100%',
    alignItems: 'center',
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
    width: '100%',
  },
  featureEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    flex: 1,
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