import * as Location from 'expo-location';
import { Alert, Linking } from 'react-native';
import { supabase } from '@/lib/supabase';
import { profileService } from '@/services/profileService';

export interface LocationData {
  town: string;
  postal_code: number;
  latitude: number;
  longitude: number;
}

export interface LocationServiceResult {
  success: boolean;
  data?: LocationData;
  error?: string;
}

class LocationService {
  
  async requestLocationPermission(): Promise<boolean> {
    try {
      // Vérifier le statut actuel des permissions
      const { status: foregroundStatus } = await Location.getForegroundPermissionsAsync();
      
      if (foregroundStatus === 'granted') {
        return true;
      }

      if (foregroundStatus === 'denied') {
        // Permission refusée précédemment, rediriger vers les paramètres
        Alert.alert(
          'Permission requise',
          'L\'accès à la localisation a été refusé. Veuillez l\'autoriser dans les paramètres de l\'application pour continuer.',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Ouvrir les paramètres', onPress: () => Linking.openSettings() }
          ]
        );
        return false;
      }

      // Demander la permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'L\'accès à la localisation est nécessaire pour mettre à jour votre position.',
          [{ text: 'OK' }]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ LocationService: Erreur lors de la demande de permission:', error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<LocationServiceResult> {
    try {
      // Vérifier les permissions
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        return {
          success: false,
          error: 'Permission de localisation refusée'
        };
      }

      // Vérifier si les services de localisation sont activés
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        Alert.alert(
          'Services de localisation désactivés',
          'Veuillez activer les services de localisation dans les paramètres de votre appareil.',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Ouvrir les paramètres', onPress: () => Linking.openSettings() }
          ]
        );
        return {
          success: false,
          error: 'Services de localisation désactivés'
        };
      }

      // Obtenir la position actuelle
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
        distanceInterval: 100,
      });

      // Géocoder inverse pour obtenir l'adresse
      const addresses = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      if (addresses.length === 0) {
        return {
          success: false,
          error: 'Impossible de déterminer l\'adresse'
        };
      }

      const address = addresses[0];
      
      // Extraire les informations nécessaires avec plus de fallbacks
      const town = address.city || 
                  address.subregion || 
                  address.region || 
                  address.district ||
                  address.name || 
                  'Ville inconnue';
      
      let postalCode = 0;
      if (address.postalCode) {
        // Extraire uniquement les chiffres du code postal
        const numericPostalCode = address.postalCode.replace(/\D/g, '');
        postalCode = parseInt(numericPostalCode, 10) || 0;
      }

      if (!town || town === 'Ville inconnue') {
        return {
          success: false,
          error: 'Impossible de déterminer la ville'
        };
      }

      // Accepter même si le code postal est 0 (certaines régions n'en ont pas)
      return {
        success: true,
        data: {
          town,
          postal_code: postalCode,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }
      };

    } catch (error) {
      console.error('❌ LocationService: Erreur lors de l\'obtention de la localisation:', error);
      
      let errorMessage = 'Erreur lors de l\'obtention de la localisation';
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = 'Délai d\'attente dépassé. Veuillez réessayer.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Erreur de réseau. Vérifiez votre connexion.';
        } else if (error.message.includes('denied')) {
          errorMessage = 'Permission de localisation refusée.';
        } else {
          errorMessage = error.message;
        }
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async showLocationExplanation(): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        'Autorisation de localisation',
        'Cette application a besoin d\'accéder à votre localisation pour :\n\n' +
        '• Vous connecter avec des personnes près de chez vous\n' +
        '• Suggérer des salles de sport locales\n' +
        '• Améliorer votre expérience utilisateur\n\n' +
        'Vos données de localisation sont traitées de manière sécurisée et ne sont pas partagées avec des tiers.',
        [
          { 
            text: 'Refuser', 
            style: 'cancel',
            onPress: () => resolve(false)
          },
          { 
            text: 'Autoriser', 
            onPress: () => resolve(true)
          }
        ]
      );
    });
  }

  async updateLocationInDatabase(
    userId: string, 
    locationData: LocationData, 
    existingLocationId?: string
  ): Promise<string> {
    console.log('📍 LocationService: Updating location in database for user:', userId);
    
    // Créer le payload avec postal_code comme integer et location comme geography
    const locationPayload = {
      town: locationData.town,
      postal_code: locationData.postal_code,
      location: `POINT(${locationData.longitude} ${locationData.latitude})` // Format WKT pour PostGIS
    };

    console.log('📍 LocationService: Location payload:', locationPayload);

    let locationId: string;

    if (existingLocationId) {
      // Essayer de mettre à jour la localisation existante
      console.log('📍 LocationService: Updating existing location:', existingLocationId);
      const { data, error } = await supabase
        .from('location')
        .update(locationPayload)
        .eq('id', existingLocationId)
        .select('*');

      if (error) {
        console.warn('⚠️ LocationService: Could not update existing location:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        // La localisation n'existe pas, créer une nouvelle
        console.log('📍 LocationService: Creating new location (existing not found)');
        const { data: newLocationData, error: createError } = await supabase
          .from('location')
          .insert([locationPayload])
          .select('*')
          .single();

        if (createError) throw createError;

        locationId = newLocationData.id;
      } else {
        locationId = data[0].id;
        console.log('✅ LocationService: Location updated successfully:', locationId);
      }
    } else {
      // Créer une nouvelle localisation
      console.log('📍 LocationService: Creating new location');
      const { data, error } = await supabase
        .from('location')
        .insert([locationPayload])
        .select('*')
        .single();

      if (error) {
        console.error('❌ LocationService: Failed to create location:', error);
        throw error;
      }

      locationId = data.id;
      console.log('✅ LocationService: Location created successfully:', locationId);
    }

    // Invalider le cache du profil après mise à jour de la localisation
    profileService.invalidateProfileCache(userId);

    return locationId;
  }

  // Nouvelle méthode pour mettre à jour la localisation d'un profil
  async updateUserLocation(userId: string, locationData: LocationData): Promise<void> {
    try {
      // 1. Créer ou mettre à jour la localisation
      const locationId = await this.updateLocationInDatabase(userId, locationData);
      
      // 2. Mettre à jour le profil avec la nouvelle localisation
      const { error } = await supabase
        .from('profile')
        .update({ id_location: locationId })
        .eq('id_user', userId);

      if (error) {
        console.error('❌ LocationService: Profile location update failed:', error);
        throw error;
      }

      console.log('✅ LocationService: User location updated successfully');
      
      // 3. Invalider le cache du profil
      profileService.invalidateProfileCache(userId);
      
      // 4. Forcer le rechargement du profil
      await profileService.nukeAndReload(userId);
      
    } catch (error) {
      console.error('❌ LocationService: User location update error:', error);
      throw error;
    }
  }

  // Nouvelle méthode pour récupérer la localisation d'un utilisateur
  async getUserLocation(userId: string): Promise<Location | null> {
    console.log('📍 LocationService: Getting location for user:', userId);
    
    try {
      // 1. Récupérer le profil pour avoir l'ID de localisation
      const { data: profile, error: profileError } = await supabase
        .from('profile')
        .select('id_location')
        .eq('id_user', userId)
        .single();

      if (profileError || !profile) {
        console.log('❌ LocationService: Profile not found for user:', userId);
        return null;
      }

      if (!profile.id_location) {
        console.log('📭 LocationService: No location ID in profile for user:', userId);
        return null;
      }

      console.log('🔍 LocationService: Location ID found:', profile.id_location);

      // 2. Récupérer les détails de la localisation
      const { data: location, error: locationError } = await supabase
        .from('location')
        .select('*')
        .eq('id', profile.id_location)
        .single();

      if (locationError) {
        console.error('❌ LocationService: Error loading location:', locationError);
        return null;
      }

      console.log('✅ LocationService: Location data from DB:', location);
      return location;
    } catch (error) {
      console.error('💥 LocationService: Critical error getting location:', error);
      return null;
    }
  }
}



export const locationService = new LocationService();
