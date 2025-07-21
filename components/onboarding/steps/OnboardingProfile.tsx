import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { OnboardingProfile } from '@/types/onboarding';
import { OnboardingService } from '@/services/onboardingService';
import { locationService } from '@/services/locationService';

interface OnboardingProfileProps {
  data?: OnboardingProfile;
  onNext: (profile: OnboardingProfile) => void;
  onBack: () => void;
}

export default function OnboardingProfile({ data, onNext, onBack }: OnboardingProfileProps) {
  const [profile, setProfile] = useState<OnboardingProfile>({
    lastname: data?.lastname || '',
    firstname: data?.firstname || '',
    birthdate: data?.birthdate || null,
    location: data?.location,
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const handleLocationUpdate = async () => {
    try {
      setGettingLocation(true);

      const userAccepted = await locationService.showLocationExplanation();
      if (!userAccepted) {
        setGettingLocation(false);
        return;
      }

      const result = await locationService.getCurrentLocation();
      
      if (!result.success || !result.data) {
        Alert.alert('Erreur', result.error || 'Impossible d\'obtenir la localisation');
        setGettingLocation(false);
        return;
      }

      setProfile(prev => ({ ...prev, location: result.data! }));
      setGettingLocation(false);
      Alert.alert('Succès', 'Localisation mise à jour !');

    } catch (error) {
      Alert.alert('Erreur', 'Une erreur inattendue s\'est produite');
      setGettingLocation(false);
    }
  };

  const handleNext = () => {
    const errors = OnboardingService.validateProfile(profile);
    
    if (errors.length > 0) {
      Alert.alert('Erreur de validation', errors.join('\n'));
      return;
    }

    onNext(profile);
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
              <Text style={styles.locationText}>
                {profile.location 
                  ? `${profile.location.town} (${profile.location.postal_code})`
                  : 'Non définie'
                }
              </Text>
              <TouchableOpacity 
                style={styles.locationButton}
                onPress={handleLocationUpdate}
                disabled={gettingLocation}
              >
                {gettingLocation ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <Text style={styles.locationButtonText}>📍 Obtenir ma position</Text>
                )}
              </TouchableOpacity>
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
        
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Suivant</Text>
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
  locationText: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 8,
  },
  locationButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
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
});
