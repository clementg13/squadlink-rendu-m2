import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ActionSheetIOS
} from 'react-native';
import { useProfile } from '@/stores/profileStore';
import { useCurrentUserProfileCompletion } from '@/hooks/useCurrentUserProfileCompletion';
import { router } from 'expo-router';

// Composants
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileIncompleteAlert from '@/components/profile/ProfileIncompleteAlert';
import ProfileForm from '@/components/profile/ProfileForm';
import ProfileHobbies from '@/components/profile/ProfileHobbies';
import ProfileActions from '@/components/profile/ProfileActions';
import ErrorMessage from '@/components/ui/ErrorMessage';
import ProfileGym from '@/components/profile/gym/ProfileGym';
import ProfileLocation from '@/components/profile/location/ProfileLocation';
import ProfileSports from '@/components/profile/sports/ProfileSports';
import ProfileSocialMedias from '@/components/profile/socialMedias/ProfileSocialMedias';

export default function ProfileScreen() {
  const { 
    profile, 
    hobbies,
    gyms,
    gymSubscriptions,
    sports,
    sportLevels,
    socialMedias,
    loading, 
    saving,
    error,
    initialized,
    initialize,
    loadProfile,
    updateProfile,
    clearError,
    addUserHobby,
    removeUserHobby,
    toggleHighlightHobby,
    addUserSport,
    removeUserSport,
    addUserSocialMedia,
    updateUserSocialMedia,
    removeUserSocialMedia,
    loadGymSubscriptions,
    updateLocation
  } = useProfile();

  const { isComplete, isLoading: profileCompletionLoading, completionPercentage, missingFields } = useCurrentUserProfileCompletion();

  const [formData, setFormData] = useState({
    lastname: '',
    firstname: '',
    birthdate: '',
    biography: '',
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const initializeStore = async () => {
      // Forcer la re-initialisation si nécessaire
      if (sports.length === 0 && sportLevels.length === 0 && socialMedias.length === 0) {
        await initialize();
      }
      
      if (!initialized) {
        await initialize();
      }
      
      await loadProfile();
    };
    
    initializeStore();
  }, [initialized, initialize, loadProfile]); // Suppression des dépendances qui changent trop souvent

  useEffect(() => {
    if (profile) {
      setFormData({
        lastname: profile.lastname || '',
        firstname: profile.firstname || '',
        birthdate: profile.birthdate || '',
        biography: profile.biography || '',
      });
    }
  }, [profile]);

  const handleFieldChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    
    if (error) {
      clearError();
    }
  }, [error, clearError]);

  const handleSave = useCallback(async () => {
    // Validation des champs requis
    if (!formData.firstname || !formData.lastname) {
      Alert.alert('Erreur', 'Le prénom et le nom sont requis');
      return;
    }

    const updateData = {
      lastname: formData.lastname.trim(),
      firstname: formData.firstname.trim(),
      birthdate: formData.birthdate,
      biography: formData.biography?.trim() || undefined,
      // Ne pas inclure id_gym et id_gymsubscription ici car ils sont gérés séparément
    };

    console.log('🔄 ProfileScreen: Saving profile data:', updateData);

    const { error } = await updateProfile(updateData);
    
    if (error) {
      Alert.alert('Erreur', error.message);
    } else {
      setHasChanges(false);
      Alert.alert('Succès', 'Profil mis à jour avec succès !');
      // Recharger le profil pour s'assurer que les données sont à jour
      await loadProfile();
    }
  }, [formData, updateProfile, loadProfile]);

  const handleCancel = useCallback(() => {
    if (profile) {
      const resetData = {
        lastname: profile.lastname || '',
        firstname: profile.firstname || '',
        birthdate: profile.birthdate || '',
        biography: profile.biography || '',
      };
      console.log('🔄 ProfileScreen: Resetting form data:', resetData);
      setFormData(resetData);
    }
    setHasChanges(false);
    clearError();
  }, [profile, clearError]);

  const handleAddHobby = useCallback(async (hobbyId: string) => {
    const { error } = await addUserHobby(hobbyId);
    if (error) {
      Alert.alert('Erreur', error.message);
    }
  }, [addUserHobby]);

  const handleRemoveHobby = useCallback(async (hobbyId: string) => {
    const { error } = await removeUserHobby(hobbyId);
    if (error) {
      Alert.alert('Erreur', error.message);
    }
  }, [removeUserHobby]);

  const handleToggleHighlight = useCallback(async (hobbyId: string) => {
    const { error } = await toggleHighlightHobby(hobbyId);
    if (error) {
      Alert.alert('Erreur', error.message);
    }
  }, [toggleHighlightHobby]);

  const handleAddSport = useCallback(async (sportId: string, levelId: string) => {
    const { error } = await addUserSport(sportId, levelId);
    if (error) {
      Alert.alert('Erreur', error.message);
    }
  }, [addUserSport]);

  const handleRemoveSport = useCallback(async (sportId: string) => {
    const { error } = await removeUserSport(sportId);
    if (error) {
      Alert.alert('Erreur', error.message);
    }
  }, [removeUserSport]);

  const handleAddSocialMedia = useCallback(async (socialMediaId: string, username: string) => {
    const { error } = await addUserSocialMedia(socialMediaId, username);
    if (error) {
      Alert.alert('Erreur', error.message);
    }
  }, [addUserSocialMedia]);

  const handleUpdateSocialMedia = useCallback(async (socialMediaId: string, username: string) => {
    const { error } = await updateUserSocialMedia(socialMediaId, username);
    if (error) {
      Alert.alert('Erreur', error.message);
    }
  }, [updateUserSocialMedia]);

  const handleRemoveSocialMedia = useCallback(async (socialMediaId: string) => {
    const { error } = await removeUserSocialMedia(socialMediaId);
    if (error) {
      Alert.alert('Erreur', error.message);
    }
  }, [removeUserSocialMedia]);

  const handleUpdateGym = useCallback(async (subscriptionId: string | null, gymId?: string | null) => {
    try {
      const updateData: Partial<{ id_gymsubscription?: string | undefined; id_gym?: string | undefined }> = {};
      
      // Handle subscription ID
      if (subscriptionId === null) {
        updateData.id_gymsubscription = undefined;
      } else if (subscriptionId) {
        updateData.id_gymsubscription = subscriptionId;
      }
      
      // Handle gym ID
      if (gymId === null) {
        updateData.id_gym = undefined;
      } else if (gymId) {
        updateData.id_gym = gymId;
      }

      console.log('🔄 ProfileScreen: Updating gym data:', updateData);

      // Ensure we have valid update data
      if (Object.keys(updateData).length === 0) {
        console.warn('⚠️ ProfileScreen: No gym data to update');
        return;
      }

      const { error } = await updateProfile(updateData);
      if (error) {
        console.error('❌ ProfileScreen: Gym update failed:', error);
        Alert.alert('Erreur', `Erreur lors de la mise à jour de la salle: ${error.message}`);
      } else {
        console.log('✅ ProfileScreen: Gym updated successfully');
        // Recharger le profil après mise à jour de la salle
        await loadProfile();
      }
    } catch (err) {
      console.error('❌ ProfileScreen: Unexpected error during gym update:', err);
      Alert.alert('Erreur', 'Une erreur inattendue est survenue lors de la mise à jour de la salle');
    }
  }, [updateProfile, loadProfile]);

  const handleLoadGymSubscriptions = useCallback(async () => {
    await loadGymSubscriptions();
  }, [loadGymSubscriptions]);

  const handleUpdateLocation = useCallback(async (locationData: { town: string; postal_code: number; latitude: number; longitude: number }) => {
    const { error } = await updateLocation(locationData);
    
    if (error) {
      Alert.alert('Erreur', error.message);
    }
  }, [updateLocation]);

  const handleOpenLegal = useCallback(() => {
    // Utilise ActionSheetIOS uniquement sur iOS, sinon fallback simple pour Android/web
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Annuler', 'Conditions d\'utilisation', 'Politique de confidentialité'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            router.push('/terms');
          } else if (buttonIndex === 2) {
            router.push('/privacy');
          }
        }
      );
    } else {
      // Fallback Android/web: simple Alert avec liens
      Alert.alert(
        'Informations légales',
        'Choisissez une option',
        [
          {
            text: 'Conditions d\'utilisation',
            onPress: () => router.push('/terms'),
          },
          {
            text: 'Politique de confidentialité',
            onPress: () => router.push('/privacy'),
          },
          {
            text: 'Annuler',
            style: 'cancel',
          },
        ]
      );
    }
  }, []);

  if (loading && !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header fixe avec roue crantée */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          onPress={handleOpenLegal}
          style={styles.settingsButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Ouvrir les informations légales"
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <ProfileHeader 
            firstname={formData.firstname}
            lastname={formData.lastname}
          />

          {/* Alerte profil incomplet */}
          {!profileCompletionLoading && !isComplete && (
            <ProfileIncompleteAlert 
              completionPercentage={completionPercentage}
              missingFields={missingFields}
              compact={false}
              clickable={false}
            />
          )}

          <ProfileForm
            formData={formData}
            saving={saving}
            onFieldChange={handleFieldChange}
          />

          {error && <ErrorMessage message={error} />}

          <ProfileLocation
            profile={profile}
            saving={saving}
            onUpdateLocation={handleUpdateLocation}
          />

          <ProfileGym
            profile={profile}
            gyms={gyms}
            gymSubscriptions={gymSubscriptions}
            saving={saving}
            onUpdateGym={handleUpdateGym}
            onLoadGymSubscriptions={handleLoadGymSubscriptions}
          />

          <ProfileSports
            profile={profile}
            sports={sports}
            sportLevels={sportLevels}
            saving={saving}
            onAddSport={handleAddSport}
            onRemoveSport={handleRemoveSport}
          />

          <ProfileSocialMedias
            profile={profile}
            socialMedias={socialMedias}
            saving={saving}
            onAddSocialMedia={handleAddSocialMedia}
            onUpdateSocialMedia={handleUpdateSocialMedia}
            onRemoveSocialMedia={handleRemoveSocialMedia}
          />

          <ProfileHobbies
            profile={profile}
            hobbies={hobbies}
            saving={saving}
            onAddHobby={handleAddHobby}
            onRemoveHobby={handleRemoveHobby}
            onToggleHighlight={handleToggleHighlight}
          />

          <ProfileActions
            hasChanges={hasChanges}
            saving={saving}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 16,
    paddingRight: 18,
    backgroundColor: '#fff',
    // Ajout d'une ombre légère pour séparer visuellement le header
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 10,
  },
  settingsButton: {
    padding: 4,
  },
  settingsIcon: {
    fontSize: 26,
    opacity: 0.7,
  },
});