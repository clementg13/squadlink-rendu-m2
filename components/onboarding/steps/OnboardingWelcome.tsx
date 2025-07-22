import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface OnboardingWelcomeProps {
  onNext: () => void;
}

export default function OnboardingWelcome({ onNext }: OnboardingWelcomeProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🏋️‍♂️</Text>
        <Text style={styles.title}>Bienvenue sur SquadLink</Text>
        <Text style={styles.subtitle}>
          L'application qui vous connecte avec des partenaires sportifs près de chez vous
        </Text>
        
        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureEmoji}>🤝</Text>
            <Text style={styles.featureText}>Trouvez des partenaires d'entraînement</Text>
          </View>
          
          <View style={styles.feature}>
            <Text style={styles.featureEmoji}>🎯</Text>
            <Text style={styles.featureText}>Partagez vos objectifs sportifs</Text>
          </View>
          
          <View style={styles.feature}>
            <Text style={styles.featureEmoji}>📍</Text>
            <Text style={styles.featureText}>Découvrez des salles près de chez vous</Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity style={styles.startButton} onPress={onNext}>
        <Text style={styles.startButtonText}>Commencer</Text>
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
    fontSize: 80,
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
    paddingHorizontal: 20,
  },
  features: {
    width: '100%',
    paddingHorizontal: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
  startButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
