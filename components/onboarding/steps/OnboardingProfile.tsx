import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { OnboardingProfile } from '@/types/onboarding';
import { OnboardingService } from '@/services/onboardingService';
import { locationService } from '@/services/locationService';
import { supabase } from '@/lib/supabase';

interface OnboardingProfileProps {
  data?: OnboardingProfile;
  userId: string;
  onNext: (profile: OnboardingProfile) => void;
  onBack: () => void;
}

export default function OnboardingProfileStep({ data, userId, onNext, onBack }: OnboardingProfileProps) {
  const [profile, setProfile] = useState<OnboardingProfile>({
    lastname: data?.lastname || '',
    firstname: data?.firstname || '',
    birthdate: data?.birthdate || null,
    location: data?.location,
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleLocationUpdate = async () => {
    try {
      setGettingLocation(true);

      // Montrer l'explication avant de demander la permission
      const userAccepted = await locationService.showLocationExplanation();
      if (!userAccepted) {
        setGettingLocation(false);
        return;
      }

      // Obtenir la localisation
      const result = await locationService.getCurrentLocation();
      
      if (!result.success || !result.data) {
        Alert.alert('Erreur', result.error || 'Impossible d\'obtenir la localisation');
        setGettingLocation(false);
        return;
      }

      console.log('📍 OnboardingProfile: Location data received:', result.data);

      // Confirmer avec l'utilisateur
      const confirmMessage = result.data.postal_code > 0 
        ? `Nouvelle localisation détectée :\n${result.data.town} (${result.data.postal_code})\n\nVoulez-vous l'utiliser pour votre profil ?`
        : `Nouvelle localisation détectée :\n${result.data.town}\n\nVoulez-vous l'utiliser pour votre profil ?`;

      Alert.alert(
        'Confirmer la localisation',
        confirmMessage,
        [
          { 
            text: 'Annuler', 
            style: 'cancel',
            onPress: () => setGettingLocation(false)
          },
          { 
            text: 'Confirmer',
            onPress: async () => {
              console.log('📍 OnboardingProfile: Location confirmed, updating profile state');
              setProfile(prev => ({ ...prev, location: result.data! }));
              setGettingLocation(false);
              Alert.alert('Succès', 'Localisation mise à jour !');
            }
          }
        ]
      );

    } catch (error) {
      console.error('❌ OnboardingProfile: Location update error:', error);
      Alert.alert('Erreur', 'Une erreur inattendue s\'est produite');
      setGettingLocation(false);
    }
  };

  const handleNext = async () => {
    const errors = OnboardingService.validateProfile(profile);
    
    if (errors.length > 0) {
      Alert.alert('Erreur de validation', errors.join('\n'));
      return;
    }

    try {
      setSaving(true);
      console.log('📝 OnboardingProfile: Updating profile for user:', userId);
      
      // Mettre à jour le profil créé par le trigger
      const result = await OnboardingService.updateUserProfile(userId, profile);
      
      if (result.success) {
        console.log('✅ OnboardingProfile: Profile updated successfully, proceeding to sports');
        onNext(profile);
      } else {
        console.warn('⚠️ OnboardingProfile: Profile update failed but proceeding:', result.error);
        // Continuer quand même vers l'étape suivante
        Alert.alert(
          'Information', 
          'Nous continuerons la configuration. Votre profil sera mis à jour plus tard.',
          [
            { text: 'Continuer', onPress: () => onNext(profile) }
          ]
        );
      }
    } catch (error) {
      console.error('❌ OnboardingProfile: Profile save error:', error);
      // Permettre de continuer même en cas d'erreur
      Alert.alert(
        'Configuration en cours', 
        'Continuons la configuration de votre profil.',
        [
          { text: 'Continuer', onPress: () => onNext(profile) }
        ]
      );
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Créons votre profil</Text>
        <Text style={styles.subtitle}>
          Partagez quelques informations sur vous
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prénom *</Text>
            <TextInput
              style={styles.input}
              value={profile.firstname}
              onChangeText={(text) => setProfile(prev => ({ ...prev, firstname: text }))}
              placeholder="Votre prénom"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom *</Text>
            <TextInput
              style={styles.input}
              value={profile.lastname}
              onChangeText={(text) => setProfile(prev => ({ ...prev, lastname: text }))}
              placeholder="Votre nom"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date de naissance *</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.dateButtonText, !profile.birthdate && styles.placeholder]}>
                {profile.birthdate ? formatDate(profile.birthdate) : 'Sélectionnez votre date de naissance'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Localisation</Text>
            <View style={styles.locationContainer}>
              <View style={styles.locationRow}>
                <Text style={styles.locationLabel}>Ville actuelle :</Text>
                <Text style={styles.locationValue}>
                  {profile.location ? 
                    (profile.location.postal_code && profile.location.postal_code !== 0 
                      ? `${profile.location.town} (${profile.location.postal_code})`
                      : profile.location.town
                    ) : 
                    'Non définie'
                  }
                </Text>
              </View>
              
              <TouchableOpacity 
                style={[styles.locationButton, gettingLocation && styles.locationButtonDisabled]}
                onPress={handleLocationUpdate}
                disabled={gettingLocation}
                accessibilityRole="button"
              >
                {gettingLocation ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.locationButtonText}>Localisation...</Text>
                  </View>
                ) : (
                  <Text style={styles.locationButtonText}>📍 Obtenir ma position</Text>
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                ℹ️ Votre localisation nous aide à vous connecter avec des personnes près de chez vous
              </Text>
            </View>
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={profile.birthdate || new Date()}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setProfile(prev => ({ ...prev, birthdate: selectedDate }));
              }
            }}
          />
        )}
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.nextButton, saving && styles.nextButtonDisabled]} 
          onPress={handleNext}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.nextButtonText}>Suivant</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 32,
    lineHeight: 22,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  placeholder: {
    color: '#999',
  },
  locationContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
  },
  locationValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  locationButton: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  locationButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  infoBox: {
    backgroundColor: '#e7f3ff',
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: '#b3d9ff',
    marginTop: 10,
  },
  infoText: {
    fontSize: 12,
    color: '#0066cc',
    lineHeight: 16,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonDisabled: {
    backgroundColor: '#999',
  },
});