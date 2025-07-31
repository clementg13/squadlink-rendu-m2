import { locationService, LocationData } from '@/services/locationService';
import * as Location from 'expo-location';
import { Alert, Linking } from 'react-native';

// Mock expo-location
jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  hasServicesEnabledAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
  Accuracy: { Balanced: 3 },
}));

// Mock Alert and Linking
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
  Linking: {
    openSettings: jest.fn(),
  },
  Platform: { OS: 'ios' },
}));

// Mock supabase
const mockSupabase = {
  from: jest.fn(() => ({
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn(),
  })),
};

jest.mock('../../lib/supabase', () => ({
  supabase: mockSupabase,
}));

const mockAlert = Alert.alert as jest.MockedFunction<typeof Alert.alert>;
const mockLinking = Linking.openSettings as jest.MockedFunction<typeof Linking.openSettings>;

describe('LocationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestLocationPermission', () => {
    it('returns true when permission is already granted', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const result = await locationService.requestLocationPermission();
      expect(result).toBe(true);
    });

    it('shows alert when permission is denied', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      mockAlert.mockImplementation((title, message, buttons) => {
        buttons?.[0]?.onPress?.(); // Call cancel
      });

      const result = await locationService.requestLocationPermission();
      expect(result).toBe(false);
      expect(mockAlert).toHaveBeenCalled();
    });

    it('requests permission when not determined', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const result = await locationService.requestLocationPermission();
      expect(result).toBe(true);
    });

    it('handles permission request rejection', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await locationService.requestLocationPermission();
      expect(result).toBe(false);
    });
  });

  describe('getCurrentLocation', () => {
    it('gets location successfully', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Location.hasServicesEnabledAsync as jest.Mock).mockResolvedValue(true);
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
        coords: {
          latitude: 48.8566,
          longitude: 2.3522,
        },
      });
      (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([
        {
          city: 'Paris',
          postalCode: '75001',
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

    it('handles permission denied', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await locationService.getCurrentLocation();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Permission de localisation refusée');
    });

    it('handles services disabled', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Location.hasServicesEnabledAsync as jest.Mock).mockResolvedValue(false);

      const result = await locationService.getCurrentLocation();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Services de localisation désactivés');
    });

    it('handles no addresses found', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Location.hasServicesEnabledAsync as jest.Mock).mockResolvedValue(true);
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
        coords: { latitude: 48.8566, longitude: 2.3522 },
      });
      (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([]);

      const result = await locationService.getCurrentLocation();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Impossible de déterminer l\'adresse');
    });

    it('handles geocoding with fallback city names', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Location.hasServicesEnabledAsync as jest.Mock).mockResolvedValue(true);
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
        coords: { latitude: 48.8566, longitude: 2.3522 },
      });
      (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([
        {
          city: null,
          subregion: 'Île-de-France',
          postalCode: '75001',
        },
      ]);

      const result = await locationService.getCurrentLocation();

      expect(result.success).toBe(true);
      expect(result.data?.town).toBe('Île-de-France');
    });

    it('handles missing postal code', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Location.hasServicesEnabledAsync as jest.Mock).mockResolvedValue(true);
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
        coords: { latitude: 48.8566, longitude: 2.3522 },
      });
      (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([
        {
          city: 'Paris',
          postalCode: null,
        },
      ]);

      const result = await locationService.getCurrentLocation();

      expect(result.success).toBe(true);
      expect(result.data?.postal_code).toBe(0);
    });
  });

  describe('showLocationExplanation', () => {
    it('resolves true when user accepts', async () => {
      mockAlert.mockImplementation((title, message, buttons) => {
        buttons?.[1]?.onPress?.(); // Call "Autoriser"
      });

      const promise = locationService.showLocationExplanation();
      expect(await promise).toBe(true);
    });

    it('resolves false when user refuses', async () => {
      mockAlert.mockImplementation((title, message, buttons) => {
        buttons?.[0]?.onPress?.(); // Call "Refuser"
      });

      const promise = locationService.showLocationExplanation();
      expect(await promise).toBe(false);
    });
  });
});