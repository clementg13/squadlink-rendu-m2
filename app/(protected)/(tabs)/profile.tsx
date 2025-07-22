import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/stores/authStore';
import { useProfile } from '@/stores/profileStore';

// Composants
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileForm from '@/components/profile/ProfileForm';
import ProfileHobbies from '@/components/profile/ProfileHobbies';
import ProfileInfo from '@/components/profile/ProfileInfo';
import ProfileActions from '@/components/profile/ProfileActions';
import ErrorMessage from '@/components/ui/ErrorMessage';
import ProfileGym from '@/components/profile/gym/ProfileGym';
import ProfileLocation from '@/components/profile/location/ProfileLocation';
import ProfileSports from '@/components/profile/sports/ProfileSports';
import ProfileSocialMedias from '@/components/profile/socialMedias/ProfileSocialMedias';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
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
    loadProfile,
    addUserHobby,
    removeUserHobby,
    toggleHighlightHobby,
    addUserSport,
    removeUserSport,
    addUserSocialMedia,
    updateUserSocialMedia,
    removeUserSocialMedia,
    updateProfile,
    updateLocation,
    loadGymSubscriptions,
    initialize,
    clearError 
  } = useProfile();

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
  }, [initialized]);

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

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    
    if (error) {
      clearError();
    }
  };

  const handleSave = async () => {
    const updateData = {
      lastname: formData.lastname,
      firstname: formData.firstname,
      birthdate: formData.birthdate,
      biography: formData.biography,
      id_gym: profile?.id_gym,
      id_gymsubscription: profile?.id_gymsubscription,
    };

    const { error } = await updateProfile(updateData);
    
    if (error) {
      Alert.alert('Erreur', error.message);
    } else {
      setHasChanges(false);
      Alert.alert('Succès', 'Profil mis à jour avec succès !');
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        lastname: profile.lastname || '',
        firstname: profile.firstname || '',
        birthdate: profile.birthdate || '',
        biography: profile.biography || '',
      });
    }
    setHasChanges(false);
    clearError();
  };

  const handleSignOut = async () => {
    try {
      console.log('🚪 ProfileScreen: Initiating sign out');
      await signOut();
      // La redirection est gérée dans le store authStore
    } catch (error) {
      console.error('❌ ProfileScreen: Sign out error:', error);
      Alert.alert('Erreur', 'Erreur lors de la déconnexion');
    }
  };

  const handleAddHobby = async (hobbyId: string) => {
    const { error } = await addUserHobby(hobbyId);
    if (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  const handleRemoveHobby = async (hobbyId: string) => {
    const { error } = await removeUserHobby(hobbyId);
    if (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  const handleToggleHighlight = async (hobbyId: string) => {
    const { error } = await toggleHighlightHobby(hobbyId);
    if (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  const handleAddSport = async (sportId: string, levelId: string) => {
    const { error } = await addUserSport(sportId, levelId);
    if (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  const handleRemoveSport = async (sportId: string) => {
    const { error } = await removeUserSport(sportId);
    if (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  const handleAddSocialMedia = async (socialMediaId: string, username: string) => {
    const { error } = await addUserSocialMedia(socialMediaId, username);
    if (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  const handleUpdateSocialMedia = async (socialMediaId: string, username: string) => {
    const { error } = await updateUserSocialMedia(socialMediaId, username);
    if (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  const handleRemoveSocialMedia = async (socialMediaId: string) => {
    const { error } = await removeUserSocialMedia(socialMediaId);
    if (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  const handleUpdateGym = async (subscriptionId: string | null) => {
    const updateData = {
      id_gymsubscription: subscriptionId !== null ? subscriptionId : undefined,
    };

    const { error } = await updateProfile(updateData);
    
    if (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  const handleLoadGymSubscriptions = async () => {
    await loadGymSubscriptions();
  };

  const handleUpdateLocation = async (locationData: { town: string; postal_code: number; latitude: number; longitude: number }) => {
    const { error } = await updateLocation(locationData);
    
    if (error) {
      Alert.alert('Erreur', error.message);
    }
  };

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
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <ProfileHeader 
            firstname={formData.firstname}
            lastname={formData.lastname}
          />

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

          <ProfileInfo profile={profile} />

          <ProfileActions
            hasChanges={hasChanges}
            saving={saving}
            onSave={handleSave}
            onCancel={handleCancel}
            onSignOut={handleSignOut}
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
});