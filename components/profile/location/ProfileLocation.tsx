import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { UserProfile } from '@/types/profile';
import { locationService } from '@/services/locationService';

interface ProfileLocationProps {
  profile?: UserProfile | null;
  saving: boolean;
  onUpdateLocation: (locationData: { town: string; postal_code: number; latitude: number; longitude: number }) => Promise<void>;
}

export default function ProfileLocation({ 
  profile, 
  saving, 
  onUpdateLocation 
}: ProfileLocationProps) {
  const [updatingLocation, setUpdatingLocation] = useState(false);

  const handleUpdateLocation = async () => {
    try {
      setUpdatingLocation(true);

      // Montrer l'explication avant de demander la permission
      const userAccepted = await locationService.showLocationExplanation();
      if (!userAccepted) {
        setUpdatingLocation(false);
        return;
      }

      // Obtenir la localisation
      const result = await locationService.getCurrentLocation();
      
      if (!result.success || !result.data) {
        Alert.alert('Erreur', result.error || 'Impossible d\'obtenir la localisation');
        setUpdatingLocation(false);
        return;
      }

      // Confirmer avec l'utilisateur
      const confirmMessage = result.data.postal_code > 0 
        ? `Nouvelle localisation détectée :\n${result.data.town} (${result.data.postal_code})\n\nVoulez-vous mettre à jour votre profil ?`
        : `Nouvelle localisation détectée :\n${result.data.town}\n\nVoulez-vous mettre à jour votre profil ?`;

      Alert.alert(
        'Confirmer la localisation',
        confirmMessage,
        [
          { 
            text: 'Annuler', 
            style: 'cancel',
            onPress: () => setUpdatingLocation(false)
          },
          { 
            text: 'Confirmer',
            onPress: async () => {
              try {
                await onUpdateLocation(result.data!);
                setUpdatingLocation(false);
                Alert.alert('Succès', 'Votre localisation a été mise à jour !');
              } catch {
                setUpdatingLocation(false);
                Alert.alert('Erreur', 'Une erreur s\'est produite lors de la mise à jour');
              }
            }
          }
        ]
      );

    } catch {
      Alert.alert('Erreur', 'Une erreur inattendue s\'est produite');
      setUpdatingLocation(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Localisation</Text>
      
      <View style={styles.locationInfo}>
        <View style={styles.locationRow}>
          <Text style={styles.label}>Ville actuelle :</Text>
          <Text style={styles.value}>
            {profile?.location ? 
              (profile.location.postal_code && profile.location.postal_code !== '0' 
                ? `${profile.location.town} (${profile.location.postal_code})`
                : profile.location.town
              ) : 
              'Non définie'
            }
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.updateButton, (saving || updatingLocation) && styles.buttonDisabled]}
          onPress={handleUpdateLocation}
          disabled={saving || updatingLocation}
          accessibilityRole="button"
        >
          {updatingLocation ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.updateButtonText}>Localisation...</Text>
            </View>
          ) : (
            <Text style={styles.updateButtonText}>📍 Mettre à jour ma position</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>ℹ️ À propos de votre localisation</Text>
        <Text style={styles.infoText}>
          • Votre localisation nous aide à vous connecter avec des personnes près de chez vous{'\n'}
          • Elle est utilisée pour suggérer des salles de sport locales{'\n'}
          • Vos données sont traitées de manière sécurisée et ne sont pas partagées{'\n'}
          • Vous pouvez la mettre à jour à tout moment
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  locationInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginBottom: 15,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
  },
  value: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  updateButton: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#6c757d',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  infoBox: {
    backgroundColor: '#e7f3ff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#b3d9ff',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066cc',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#0066cc',
    lineHeight: 16,
  },
});