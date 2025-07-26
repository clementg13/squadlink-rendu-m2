import React from 'react';
import {
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useAuthUser, useAuthLoading } from '@/stores/authStore';
import CompatibleProfilesList from '@/components/profile/CompatibleProfilesList';
import { CompatibleProfile } from '@/types/profile';

export default function HomeScreen() {
  const user = useAuthUser();
  const authLoading = useAuthLoading();

  // Gérer la sélection d'un profil
  const handleProfilePress = (profile: CompatibleProfile) => {
    console.log('🏠 HomeScreen: Profil sélectionné:', profile.firstname, profile.lastname);
    // Ici, on pourrait naviguer vers une page de détail du profil
    // ou ouvrir un modal avec plus d'informations
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

  // Interface principale - laissons CompatibleProfilesList gérer son propre header et états
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
