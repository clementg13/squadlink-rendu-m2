import React from 'react';
import {
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useAuthUser, useAuthLoading } from '@/stores/authStore';
import { router } from 'expo-router';
import CompatibleProfilesList from '@/components/profile/CompatibleProfilesList';
import { EnrichedCompatibleProfile } from '@/services/compatibleProfileService';

export default function HomeScreen() {
  const user = useAuthUser();
  const authLoading = useAuthLoading();

  // Gérer la sélection d'un profil
  const handleProfilePress = (profile: EnrichedCompatibleProfile) => {
    console.log('🏠 HomeScreen: Profil enrichi sélectionné:', profile.firstname, profile.lastname);
    console.log('🏠 HomeScreen: Données enrichies:', {
      age: profile.age,
      location: profile.location?.town,
      sports: profile.sports?.length,
      hobbies: profile.hobbies?.length,
    });
    
    // Naviguer vers la page de détail du profil
    router.push({
      pathname: '/(protected)/profile-detail',
      params: {
        profile: JSON.stringify(profile)
      }
    });
  };

  // Affichage pendant le chargement initial de l'authentification
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Connexion en cours...</Text>
      </View>
    );
  }

  // Interface principale - utilisons la liste de profils compatibles
  return (
    <View style={styles.container}>
      <CompatibleProfilesList 
        onProfilePress={handleProfilePress}
        showWelcomeHeader={true}
        userName={user?.email?.split('@')[0] || 'Utilisateur'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
  },
});
