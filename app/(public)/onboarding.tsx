import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    title: 'Bienvenue sur SquadLink',
    description: 'Connectez-vous avec votre équipe et collaborez efficacement.',
    emoji: '👋',
  },
  {
    id: 2,
    title: 'Restez organisé',
    description: 'Gérez vos projets et tâches en toute simplicité.',
    emoji: '📋',
  },
  {
    id: 3,
    title: 'Collaborez en temps réel',
    description: 'Communiquez instantanément avec votre équipe.',
    emoji: '🚀',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Dernière slide, aller vers l'authentification
      router.replace('/(auth)/login');
    }
  };

  const skipOnboarding = () => {
    router.replace('/(auth)/login');
  };

  const currentSlide = onboardingData[currentIndex];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header avec bouton Skip */}
      <View style={styles.header}>
        <TouchableOpacity onPress={skipOnboarding}>
          <Text style={styles.skipText}>Passer</Text>
        </TouchableOpacity>
      </View>

      {/* Contenu principal */}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.slide}>
          <Text style={styles.emoji}>{currentSlide.emoji}</Text>
          <Text style={styles.title}>{currentSlide.title}</Text>
          <Text style={styles.description}>{currentSlide.description}</Text>
        </View>

        {/* Indicateurs de page */}
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      </ScrollView>

      {/* Footer avec bouton */}
              <View style={styles.footer}>
          <TouchableOpacity style={styles.button} onPress={nextSlide}>
            <Text style={styles.buttonText}>
              {currentIndex === onboardingData.length - 1 ? 'Commencer' : 'Suivant'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.legalLinks}>
            <TouchableOpacity onPress={() => router.push('/(public)/terms')}>
              <Text style={styles.legalLinkText}>Conditions d'utilisation</Text>
            </TouchableOpacity>
            <Text style={styles.legalSeparator}> • </Text>
            <TouchableOpacity onPress={() => router.push('/(public)/privacy')}>
              <Text style={styles.legalLinkText}>Politique de confidentialité</Text>
            </TouchableOpacity>
          </View>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  skipText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width - 40,
    minHeight: 400,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#007AFF',
  },
  inactiveDot: {
    backgroundColor: '#ddd',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  legalLinkText: {
    color: '#007AFF',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  legalSeparator: {
    color: '#999',
    fontSize: 14,
  },
}); 