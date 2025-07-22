import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { locationService } from '@/services/locationService';

interface OnboardingProfileProps {
  userId: string;
  onNext: (profileData: ProfileData) => void;
  onBack: () => void;
}

interface ProfileData {
  firstname: string;
  lastname: string;
  birthdate: Date;
  location?: {
    town: string;
    postal_code: number;
    latitude: number;
    longitude: number;
  };
}

export default function OnboardingProfile({ userId, onNext, onBack }: OnboardingProfileProps) {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  
  // Initialiser avec une date par défaut (18 ans)
  const getDefaultDate = () => {
    const today = new Date();
    const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return eighteenYearsAgo;
  };
  
  const [birthdate, setBirthdate] = useState<Date>(getDefaultDate());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [location, setLocation] = useState<ProfileData['location'] | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const errors = [];

    if (!firstname.trim()) {
      errors.push('Le prénom est requis');
    }

    if (!lastname.trim()) {
      errors.push('Le nom est requis');
    }

    if (!birthdate) {
      errors.push('La date de naissance est requise');
    } else {
      const today = new Date();
      const age = today.getFullYear() - birthdate.getFullYear();
      const monthDiff = today.getMonth() - birthdate.getMonth();
      const dayDiff = today.getDate() - birthdate.getDate();
      
      // Calcul précis de l'âge
      const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
      
      if (actualAge < 16) {
        errors.push('Vous devez avoir au moins 16 ans');
      }
      if (actualAge > 100) {
        errors.push('Veuillez vérifier votre date de naissance');
      }
    }

    return errors;
  };

  const handleGetLocation = async () => {
    const userWantsLocation = await locationService.showLocationExplanation();
    if (!userWantsLocation) return;

    setIsLoadingLocation(true);
    try {
      const result = await locationService.getCurrentLocation();
      if (result.success && result.data) {
        setLocation(result.data);
        Alert.alert('Succès', `Localisation définie : ${result.data.town}`);
      } else {
        Alert.alert('Erreur', result.error || 'Impossible d\'obtenir la localisation');
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la géolocalisation');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleNext = () => {
    const errors = validateForm();
    if (errors.length > 0) {
      Alert.alert('Erreur de validation', errors.join('\n'));
      return;
    }

    const profileData: ProfileData = {
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      birthdate: birthdate, // birthdate est maintenant toujours défini
      location: location || undefined,
    };

    console.log('📝 OnboardingProfile: Profile data prepared:', profileData);
    onNext(profileData);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setBirthdate(selectedDate);
    }
  };

  const getMaximumDate = () => {
    const today = new Date();
    const sixteenYearsAgo = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
    return sixteenYearsAgo;
  };

  const getMinimumDate = () => {
    return new Date(1920, 0, 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Créez votre profil</Text>
        <Text style={styles.subtitle}>
          Partagez quelques informations sur vous
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prénom *</Text>
            <TextInput
              style={styles.input}
              value={firstname}
              onChangeText={setFirstname}
              placeholder="Votre prénom"
              autoCapitalize="words"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom *</Text>
            <TextInput
              style={styles.input}
              value={lastname}
              onChangeText={setLastname}
              placeholder="Votre nom"
              autoCapitalize="words"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date de naissance *</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
              disabled={isLoading}
            >
              <Text style={styles.dateText}>
                {birthdate.toLocaleDateString('fr-FR')}
              </Text>
            </TouchableOpacity>
            <Text style={styles.dateHint}>
              Vous devez avoir au moins 16 ans pour utiliser l'application
            </Text>

            {showDatePicker && (
              <DateTimePicker
                value={birthdate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                maximumDate={getMaximumDate()}
                minimumDate={getMinimumDate()}
                locale="fr-FR"
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Localisation (optionnel)</Text>
            {location ? (
              <View style={styles.locationContainer}>
                <Text style={styles.locationText}>📍 {location.town}</Text>
                <TouchableOpacity
                  style={styles.changeLocationButton}
                  onPress={handleGetLocation}
                  disabled={isLoadingLocation}
                >
                  <Text style={styles.changeLocationText}>Modifier</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.locationButton}
                onPress={handleGetLocation}
                disabled={isLoadingLocation}
              >
                {isLoadingLocation ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <Text style={styles.locationButtonText}>📍 Ajouter ma localisation</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            disabled={isLoading}
          >
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.nextButton, isLoading && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.nextButtonText}>Continuer</Text>
            )}
          </TouchableOpacity>
        </View>
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 32,
    lineHeight: 22,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
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
  dateText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  dateHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
  },
  locationText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  changeLocationButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  changeLocationText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  locationButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  locationButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  footer: {
    paddingTop: 20,
  },
  buttonRow: {
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
    flex: 2,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#999',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});