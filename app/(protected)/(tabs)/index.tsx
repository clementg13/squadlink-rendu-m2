import React from 'react';
import {
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useAuthUser, useAuthLoading } from '@/stores/authStore';
import { router } from 'expo-router';
import CompatibleProfilesList from '@/components/profile/CompatibleProfilesList';
import ProfileIncompleteAlert from '@/components/profile/ProfileIncompleteAlert';
import PendingMatchesNotification from '@/components/profile/PendingMatchesNotification';
import { CompatibleProfile } from '@/services/compatibleProfileService';
import { useCurrentUserProfileCompletion } from '@/hooks/useCurrentUserProfileCompletion';

export default function HomeScreen() {
  const user = useAuthUser();
  const authLoading = useAuthLoading();
  const { isComplete, isLoading, completionPercentage, missingFields } = useCurrentUserProfileCompletion();

  // Gérer la sélection d'un profil
  const handleProfilePress = (profile: CompatibleProfile) => {
    console.log('🏠 HomeScreen: Profil sélectionné:', profile.firstname, profile.lastname);
    console.log('🏠 HomeScreen: Données du profil:', {
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
      {/* Alerte profil incomplet */}
      {!isLoading && !isComplete && (
        <ProfileIncompleteAlert 
          completionPercentage={completionPercentage}
          missingFields={missingFields}
          compact={true}
        />
      )}
      {/* Notification des demandes d'amis reçues */}
      <PendingMatchesNotification />
      
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
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
  },
});
