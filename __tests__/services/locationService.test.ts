import { locationService, LocationData, LocationServiceResult } from '@/services/locationService';
import * as Location from 'expo-location';
import { Alert, Linking } from 'react-native';
import { supabase } from '@/lib/supabase';

// Mock expo-location
jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  hasServicesEnabledAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
  Accuracy: {
    Balanced: 'balanced',
  },
}));

// Mock react-native
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
  Linking: {
    openSettings: jest.fn(),
  },
}));

// Mock supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('LocationService', () => {
  const mockLocation = Location as jest.Mocked<typeof Location>;
  const mockAlert = Alert as jest.Mocked<typeof Alert>;
  const mockLinking = Linking as jest.Mocked<typeof Linking>;
  const mockSupabase = supabase as jest.Mocked<typeof supabase>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestLocationPermission', () => {
    it('should return true when permission is already granted', async () => {
      mockLocation.getForegroundPermissionsAsync.mockResolvedValue({
        status: 'granted',
        canAskAgain: true,
      });

      const result = await locationService.requestLocationPermission();

      expect(result).toBe(true);
      expect(mockLocation.getForegroundPermissionsAsync).toHaveBeenCalled();
    });

    it('should show alert and return false when permission is denied', async () => {
      mockLocation.getForegroundPermissionsAsync.mockResolvedValue({
        status: 'denied',
        canAskAgain: true,
      });

      const result = await locationService.requestLocationPermission();

      expect(result).toBe(false);
      expect(mockAlert.alert).toHaveBeenCalledWith(
        'Permission requise',
        'L\'accès à la localisation a été refusé. Veuillez l\'autoriser dans les paramètres de l\'application pour continuer.',
        expect.any(Array)
      );
    });

    it('should request permission and return true when granted', async () => {
      mockLocation.getForegroundPermissionsAsync.mockResolvedValue({
        status: 'undetermined',
        canAskAgain: true,
      });
      mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({
        status: 'granted',
        canAskAgain: true,
      });

      const result = await locationService.requestLocationPermission();

      expect(result).toBe(true);
      expect(mockLocation.requestForegroundPermissionsAsync).toHaveBeenCalled();
    });

    it('should show alert and return false when permission is refused', async () => {
      mockLocation.getForegroundPermissionsAsync.mockResolvedValue({
        status: 'undetermined',
        canAskAgain: true,
      });
      mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({
        status: 'denied',
        canAskAgain: true,
      });

      const result = await locationService.requestLocationPermission();

      expect(result).toBe(false);
      expect(mockAlert.alert).toHaveBeenCalledWith(
        'Permission refusée',
        'L\'accès à la localisation est nécessaire pour mettre à jour votre position.',
        expect.any(Array)
      );
    });

    it('should handle errors gracefully', async () => {
      mockLocation.getForegroundPermissionsAsync.mockRejectedValue(new Error('Permission error'));

      const result = await locationService.requestLocationPermission();

      expect(result).toBe(false);
    });
  });

  describe('getCurrentLocation', () => {
    it('should return location data when everything is successful', async () => {
      // Mock permissions
      mockLocation.getForegroundPermissionsAsync.mockResolvedValue({
        status: 'granted',
        canAskAgain: true,
      });

      // Mock services enabled
      mockLocation.hasServicesEnabledAsync.mockResolvedValue(true);

      // Mock current position
      mockLocation.getCurrentPositionAsync.mockResolvedValue({
        coords: {
          latitude: 48.8566,
          longitude: 2.3522,
          altitude: null,
          accuracy: 10,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      });

      // Mock reverse geocoding
      mockLocation.reverseGeocodeAsync.mockResolvedValue([
        {
          city: 'Paris',
          postalCode: '75001',
          region: 'Île-de-France',
          country: 'France',
          name: 'Paris',
          street: 'Champs-Élysées',
          district: '8ème arrondissement',
          subregion: 'Paris',
        },
      ]);

      const result = await locationService.getCurrentLocation();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        town: 'Paris',
        postal_code: 75001,
        latitude: 48.8566,
        longitude: 2.3522,
      });
    });

    it('should return error when permission is denied', async () => {
      mockLocation.getForegroundPermissionsAsync.mockResolvedValue({
        status: 'denied',
        canAskAgain: true,
      });

      const result = await locationService.getCurrentLocation();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Permission de localisation refusée');
    });

    it('should return error when services are disabled', async () => {
      mockLocation.getForegroundPermissionsAsync.mockResolvedValue({
        status: 'granted',
        canAskAgain: true,
      });
      mockLocation.hasServicesEnabledAsync.mockResolvedValue(false);

      const result = await locationService.getCurrentLocation();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Services de localisation désactivés');
      expect(mockAlert.alert).toHaveBeenCalledWith(
        'Services de localisation désactivés',
        'Veuillez activer les services de localisation dans les paramètres de votre appareil.',
        expect.any(Array)
      );
    });

    it('should handle missing address data', async () => {
      mockLocation.getForegroundPermissionsAsync.mockResolvedValue({
        status: 'granted',
        canAskAgain: true,
      });
      mockLocation.hasServicesEnabledAsync.mockResolvedValue(true);
      mockLocation.getCurrentPositionAsync.mockResolvedValue({
        coords: {
          latitude: 48.8566,
          longitude: 2.3522,
          altitude: null,
          accuracy: 10,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      });
      mockLocation.reverseGeocodeAsync.mockResolvedValue([]);

      const result = await locationService.getCurrentLocation();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Impossible de déterminer l\'adresse');
    });

    it('should handle missing city data', async () => {
      mockLocation.getForegroundPermissionsAsync.mockResolvedValue({
        status: 'granted',
        canAskAgain: true,
      });
      mockLocation.hasServicesEnabledAsync.mockResolvedValue(true);
      mockLocation.getCurrentPositionAsync.mockResolvedValue({
        coords: {
          latitude: 48.8566,
          longitude: 2.3522,
          altitude: null,
          accuracy: 10,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      });
      mockLocation.reverseGeocodeAsync.mockResolvedValue([
        {
          postalCode: '75001',
          region: null,
          country: 'France',
          name: null,
          street: null,
          district: null,
          subregion: null,
          city: null,
        },
      ]);

      const result = await locationService.getCurrentLocation();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Impossible de déterminer la ville');
    });

    it('should handle timeout errors', async () => {
      mockLocation.getForegroundPermissionsAsync.mockResolvedValue({
        status: 'granted',
        canAskAgain: true,
      });
      mockLocation.hasServicesEnabledAsync.mockResolvedValue(true);
      mockLocation.getCurrentPositionAsync.mockRejectedValue(new Error('timeout'));

      const result = await locationService.getCurrentLocation();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Délai d\'attente dépassé. Veuillez réessayer.');
    });

    it('should handle network errors', async () => {
      mockLocation.getForegroundPermissionsAsync.mockResolvedValue({
        status: 'granted',
        canAskAgain: true,
      });
      mockLocation.hasServicesEnabledAsync.mockResolvedValue(true);
      mockLocation.getCurrentPositionAsync.mockRejectedValue(new Error('network'));

      const result = await locationService.getCurrentLocation();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Erreur de réseau. Vérifiez votre connexion.');
    });
  });

  describe('showLocationExplanation', () => {
    it('should show alert and resolve with user choice', async () => {
      let alertCallback: (() => void) | undefined;
      mockAlert.alert.mockImplementation((title, message, buttons) => {
        if (buttons && buttons.length > 1) {
          alertCallback = buttons[1].onPress;
        }
      });

      const promise = locationService.showLocationExplanation();
      
      // Simulate user clicking "Autoriser"
      if (alertCallback) {
        alertCallback();
      }

      const result = await promise;

      expect(result).toBe(true);
      expect(mockAlert.alert).toHaveBeenCalledWith(
        'Autorisation de localisation',
        expect.stringContaining('Cette application a besoin d\'accéder à votre localisation'),
        expect.any(Array)
      );
    });
  });

  describe('updateLocationInDatabase', () => {
    const mockLocationData: LocationData = {
      town: 'Paris',
      postal_code: 75001,
      latitude: 48.8566,
      longitude: 2.3522,
    };

    it('should create new location when no existing location ID', async () => {
      const mockInsertQuery = {
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: { id: 'location1' },
              error: null,
            })),
          })),
        })),
      };

      mockSupabase.from.mockReturnValue(mockInsertQuery as any);

      const result = await locationService.updateLocationInDatabase('user1', mockLocationData);

      expect(result).toBe('location1');
      expect(mockSupabase.from).toHaveBeenCalledWith('location');
    });

    it('should update existing location when location ID is provided', async () => {
      const mockUpdateQuery = {
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              data: [{ id: 'location1' }],
              error: null,
            })),
          })),
        })),
      };

      mockSupabase.from.mockReturnValue(mockUpdateQuery as any);

      const result = await locationService.updateLocationInDatabase('user1', mockLocationData, 'location1');

      expect(result).toBe('location1');
      expect(mockSupabase.from).toHaveBeenCalledWith('location');
    });

    it('should create new location when update fails', async () => {
      const mockUpdateQuery = {
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              data: [],
              error: null,
            })),
          })),
        })),
      };

      const mockInsertQuery = {
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: { id: 'location2' },
              error: null,
            })),
          })),
        })),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockUpdateQuery as any)
        .mockReturnValueOnce(mockInsertQuery as any);

      const result = await locationService.updateLocationInDatabase('user1', mockLocationData, 'location1');

      expect(result).toBe('location2');
    });

    it('should handle database errors', async () => {
      const mockQuery = {
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => {
              throw new Error('Database error');
            }),
          })),
        })),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await expect(
        locationService.updateLocationInDatabase('user1', mockLocationData)
      ).rejects.toThrow('Database error');
    });
  });

  describe('static methods existence', () => {
    it('should have requestLocationPermission method', () => {
      expect(typeof locationService.requestLocationPermission).toBe('function');
    });

    it('should have getCurrentLocation method', () => {
      expect(typeof locationService.getCurrentLocation).toBe('function');
    });

    it('should have showLocationExplanation method', () => {
      expect(typeof locationService.showLocationExplanation).toBe('function');
    });

    it('should have updateLocationInDatabase method', () => {
      expect(typeof locationService.updateLocationInDatabase).toBe('function');
    });
  });

  describe('LocationData interface', () => {
    it('should have correct structure', () => {
      const locationData: LocationData = {
        town: 'Paris',
        postal_code: 75001,
        latitude: 48.8566,
        longitude: 2.3522,
      };

      expect(locationData.town).toBe('Paris');
      expect(locationData.postal_code).toBe(75001);
      expect(locationData.latitude).toBe(48.8566);
      expect(locationData.longitude).toBe(2.3522);
    });
  });

  describe('LocationServiceResult interface', () => {
    it('should have correct structure for success', () => {
      const result: LocationServiceResult = {
        success: true,
        data: {
          town: 'Paris',
          postal_code: 75001,
          latitude: 48.8566,
          longitude: 2.3522,
        },
      };

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should have correct structure for error', () => {
      const result: LocationServiceResult = {
        success: false,
        error: 'Permission denied',
      };

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.error).toBe('Permission denied');
    });
  });
}); 