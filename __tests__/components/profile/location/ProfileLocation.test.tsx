import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ProfileLocation from '@/components/profile/location/ProfileLocation';
import { UserProfile } from '@/types/profile';
import { locationService } from '@/services/locationService';

// Mock du service de localisation
jest.mock('@/services/locationService', () => ({
  locationService: {
    showLocationExplanation: jest.fn(),
    getCurrentLocation: jest.fn(),
  },
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('ProfileLocation', () => {
  const mockProfile: UserProfile = {
    id_user: '1',
    firstname: 'John',
    lastname: 'Doe',
    location: {
      id: '1',
      town: 'Paris',
      postal_code: '75001',
      location: 'Paris, France',
    },
  };

  const mockProfileWithoutLocation: UserProfile = {
    id_user: '1',
    firstname: 'John',
    lastname: 'Doe',
  };

  const mockOnUpdateLocation = jest.fn();

  beforeEach(() => {
    mockOnUpdateLocation.mockClear();
    jest.clearAllMocks();
    (Alert.alert as jest.Mock).mockClear();
    
    // Reset mocks avec des valeurs par défaut
    (locationService.showLocationExplanation as jest.Mock).mockResolvedValue(true);
    (locationService.getCurrentLocation as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        town: 'Lyon',
        postal_code: 69000,
        latitude: 45.764,
        longitude: 4.8357,
      },
    });
  });

  describe('Rendu de base', () => {
    it('renders section title correctly', () => {
      const { getByText } = render(
        <ProfileLocation
          profile={mockProfile}
          saving={false}
          onUpdateLocation={mockOnUpdateLocation}
        />
      );

      expect(getByText('Localisation')).toBeTruthy();
    });

    it('displays current location when available', () => {
      const { getByText } = render(
        <ProfileLocation
          profile={mockProfile}
          saving={false}
          onUpdateLocation={mockOnUpdateLocation}
        />
      );

      expect(getByText('Ville actuelle :')).toBeTruthy();
      expect(getByText('Paris (75001)')).toBeTruthy();
    });

    it('displays location without postal code correctly', () => {
      const profileWithoutPostalCode: UserProfile = {
        id_user: '1',
        firstname: 'John',
        lastname: 'Doe',
        location: {
          id: '1',
          town: 'Lyon',
          postal_code: '0',
          location: 'Lyon, France',
        },
      };

      const { getByText } = render(
        <ProfileLocation
          profile={profileWithoutPostalCode}
          saving={false}
          onUpdateLocation={mockOnUpdateLocation}
        />
      );

      expect(getByText('Lyon')).toBeTruthy();
    });

    it('shows "Non définie" when no location is set', () => {
      const { getByText } = render(
        <ProfileLocation
          profile={mockProfileWithoutLocation}
          saving={false}
          onUpdateLocation={mockOnUpdateLocation}
        />
      );

      expect(getByText('Non définie')).toBeTruthy();
    });

    it('handles null profile gracefully', () => {
      const { getByText } = render(
        <ProfileLocation
          profile={null}
          saving={false}
          onUpdateLocation={mockOnUpdateLocation}
        />
      );

      expect(getByText('Non définie')).toBeTruthy();
    });

    it('renders update location button', () => {
      const { getByText } = render(
        <ProfileLocation
          profile={mockProfile}
          saving={false}
          onUpdateLocation={mockOnUpdateLocation}
        />
      );

      expect(getByText('📍 Mettre à jour ma position')).toBeTruthy();
    });

    it('displays info box with location information', () => {
      const { getByText } = render(
        <ProfileLocation
          profile={mockProfile}
          saving={false}
          onUpdateLocation={mockOnUpdateLocation}
        />
      );

      expect(getByText('ℹ️ À propos de votre localisation')).toBeTruthy();
      expect(getByText(/Votre localisation nous aide à vous connecter/)).toBeTruthy();
      expect(getByText(/Vos données sont traitées de manière sécurisée/)).toBeTruthy();
      expect(getByText(/Vous pouvez la mettre à jour à tout moment/)).toBeTruthy();
    });
  });

  describe('États du bouton', () => {
    it('disables update button when saving', () => {
      const { getByText } = render(
        <ProfileLocation
          profile={mockProfile}
          saving={true}
          onUpdateLocation={mockOnUpdateLocation}
        />
      );

      const updateButton = getByText('📍 Mettre à jour ma position');
      // Vérifier que le bouton parent a la propriété disabled
      expect(updateButton.parent?.props.disabled).toBe(true);
    });

    it('shows loading state when updating location', async () => {
      const { getByText, queryByText } = render(
        <ProfileLocation
          profile={mockProfile}
          saving={false}
          onUpdateLocation={mockOnUpdateLocation}
        />
      );

      const updateButton = getByText('📍 Mettre à jour ma position');
      fireEvent.press(updateButton);

      // Vérifier l'état de chargement initial
      await waitFor(() => {
        expect(queryByText('Localisation...')).toBeTruthy();
      });
    });

    it('renders button with correct accessibility role', () => {
      const { getByText } = render(
        <ProfileLocation
          profile={mockProfile}
          saving={false}
          onUpdateLocation={mockOnUpdateLocation}
        />
      );

      const button = getByText('📍 Mettre à jour ma position');
      expect(button.parent?.props.accessibilityRole).toBe('button');
    });
  });

  describe('Formats de localisation', () => {
    it('displays correct location format with postal code', () => {
      const profileWithPostalCode: UserProfile = {
        id_user: '1',
        firstname: 'John',
        lastname: 'Doe',
        location: {
          id: '1',
          town: 'Bordeaux',
          postal_code: '33000',
          location: 'Bordeaux, France',
        },
      };

      const { getByText } = render(
        <ProfileLocation
          profile={profileWithPostalCode}
          saving={false}
          onUpdateLocation={mockOnUpdateLocation}
        />
      );

      expect(getByText('Bordeaux (33000)')).toBeTruthy();
    });

    it('handles location with zero postal code', () => {
      const profileWithZeroPostalCode: UserProfile = {
        id_user: '1',
        firstname: 'John',
        lastname: 'Doe',
        location: {
          id: '1',
          town: 'Marseille',
          postal_code: '0',
          location: 'Marseille, France',
        },
      };

      const { getByText } = render(
        <ProfileLocation
          profile={profileWithZeroPostalCode}
          saving={false}
          onUpdateLocation={mockOnUpdateLocation}
        />
      );

      expect(getByText('Marseille')).toBeTruthy();
    });

    it('handles missing location data gracefully', () => {
      const profileWithPartialLocation: UserProfile = {
        id_user: '1',
        firstname: 'John',
        lastname: 'Doe',
        location: {
          id: '1',
          town: '',
          postal_code: '',
          location: '',
        },
      };

      const { getByText } = render(
        <ProfileLocation
          profile={profileWithPartialLocation}
          saving={false}
          onUpdateLocation={mockOnUpdateLocation}
        />
      );

      expect(getByText('Localisation')).toBeTruthy();
      expect(getByText('')).toBeTruthy(); // Empty town should still render
    });

    it('handles different location formats', () => {
      const profileWithDifferentFormat: UserProfile = {
        id_user: '1',
        firstname: 'John',
        lastname: 'Doe',
        location: {
          id: '1',
          town: 'Nice',
          postal_code: '06000',
          location: 'Nice, France',
        },
      };

      const { getByText } = render(
        <ProfileLocation
          profile={profileWithDifferentFormat}
          saving={false}
          onUpdateLocation={mockOnUpdateLocation}
        />
      );

      expect(getByText('Nice (06000)')).toBeTruthy();
    });
  });

  describe('Mise à jour de localisation', () => {
    it('handles successful location update flow', async () => {
      mockOnUpdateLocation.mockResolvedValue(undefined);

      const { getByText } = render(
        <ProfileLocation
          profile={mockProfile}
          saving={false}
          onUpdateLocation={mockOnUpdateLocation}
        />
      );

      const updateButton = getByText('📍 Mettre à jour ma position');
      fireEvent.press(updateButton);

      await waitFor(() => {
        expect(locationService.showLocationExplanation).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(locationService.getCurrentLocation).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Confirmer la localisation',
          expect.stringContaining('Lyon (69000)'),
          expect.arrayContaining([
            expect.objectContaining({ text: 'Annuler', style: 'cancel' }),
            expect.objectContaining({ text: 'Confirmer' }),
          ])
        );
      });
    });

    it('handles location update with postal code 0', async () => {
      (locationService.getCurrentLocation as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          town: 'Marseille',
          postal_code: 0,
          latitude: 43.2965,
          longitude: 5.3698,
        },
      });

      const { getByText } = render(
        <ProfileLocation
          profile={mockProfile}
          saving={false}
          onUpdateLocation={mockOnUpdateLocation}
        />
      );

      const updateButton = getByText('📍 Mettre à jour ma position');
      fireEvent.press(updateButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Confirmer la localisation',
          expect.stringContaining('Marseille\n\nVoulez-vous'),
          expect.any(Array)
        );
      });
    });

    it('handles user declining location explanation', async () => {
      (locationService.showLocationExplanation as jest.Mock).mockResolvedValue(false);

      const { getByText } = render(
        <ProfileLocation
          profile={mockProfile}
          saving={false}
          onUpdateLocation={mockOnUpdateLocation}
        />
      );

      const updateButton = getByText('📍 Mettre à jour ma position');
      fireEvent.press(updateButton);

      await waitFor(() => {
        expect(locationService.showLocationExplanation).toHaveBeenCalled();
      });

      expect(locationService.getCurrentLocation).not.toHaveBeenCalled();
      expect(mockOnUpdateLocation).not.toHaveBeenCalled();
    });

    it('handles location service error', async () => {
      (locationService.getCurrentLocation as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Permission denied',
      });

      const { getByText } = render(
        <ProfileLocation
          profile={mockProfile}
          saving={false}
          onUpdateLocation={mockOnUpdateLocation}
        />
      );

      const updateButton = getByText('📍 Mettre à jour ma position');
      fireEvent.press(updateButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Permission denied');
      });
    });

    it('handles location service returning no data', async () => {
      (locationService.getCurrentLocation as jest.Mock).mockResolvedValue({
        success: false,
        data: null,
      });

      const { getByText } = render(
        <ProfileLocation
          profile={mockProfile}
          saving={false}
          onUpdateLocation={mockOnUpdateLocation}
        />
      );

      const updateButton = getByText('📍 Mettre à jour ma position');
      fireEvent.press(updateButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Erreur', 
          'Impossible d\'obtenir la localisation'
        );
      });
    });

    it('handles confirmation and successful update', async () => {
      mockOnUpdateLocation.mockResolvedValue(undefined);

      const { getByText } = render(
        <ProfileLocation
          profile={mockProfile}
          saving={false}
          onUpdateLocation={mockOnUpdateLocation}
        />
      );

      const updateButton = getByText('📍 Mettre à jour ma position');
      fireEvent.press(updateButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
      });

      // Simuler l'appui sur "Confirmer"
      const alertCall = (Alert.alert as jest.Mock).mock.calls.find(
        call => call[0] === 'Confirmer la localisation'
      );
      const confirmButton = alertCall[2].find((button: any) => button.text === 'Confirmer');
      
      await confirmButton.onPress();

      await waitFor(() => {
        expect(mockOnUpdateLocation).toHaveBeenCalledWith({
          town: 'Lyon',
          postal_code: 69000,
          latitude: 45.764,
          longitude: 4.8357,
        });
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Succès', 
          'Votre localisation a été mise à jour !'
        );
      });
    });

    it('handles update location error', async () => {
      mockOnUpdateLocation.mockRejectedValue(new Error('Update failed'));

      const { getByText } = render(
        <ProfileLocation
          profile={mockProfile}
          saving={false}
          onUpdateLocation={mockOnUpdateLocation}
        />
      );

      const updateButton = getByText('📍 Mettre à jour ma position');
      fireEvent.press(updateButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
      });

      // Simuler l'appui sur "Confirmer"
      const alertCall = (Alert.alert as jest.Mock).mock.calls.find(
        call => call[0] === 'Confirmer la localisation'
      );
      const confirmButton = alertCall[2].find((button: any) => button.text === 'Confirmer');
      
      await confirmButton.onPress();

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Erreur', 
          'Une erreur s\'est produite lors de la mise à jour'
        );
      });
    });

    it('handles cancellation during confirmation', async () => {
      const { getByText } = render(
        <ProfileLocation
          profile={mockProfile}
          saving={false}
          onUpdateLocation={mockOnUpdateLocation}
        />
      );

      const updateButton = getByText('📍 Mettre à jour ma position');
      fireEvent.press(updateButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
      });

      // Simuler l'appui sur "Annuler"
      const alertCall = (Alert.alert as jest.Mock).mock.calls.find(
        call => call[0] === 'Confirmer la localisation'
      );
      const cancelButton = alertCall[2].find((button: any) => button.text === 'Annuler');
      
      cancelButton.onPress();

      expect(mockOnUpdateLocation).not.toHaveBeenCalled();
    });

    it('handles unexpected errors during location update', async () => {
      (locationService.showLocationExplanation as jest.Mock).mockRejectedValue(
        new Error('Unexpected error')
      );

      const { getByText } = render(
        <ProfileLocation
          profile={mockProfile}
          saving={false}
          onUpdateLocation={mockOnUpdateLocation}
        />
      );

      const updateButton = getByText('📍 Mettre à jour ma position');
      fireEvent.press(updateButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Erreur', 
          'Une erreur inattendue s\'est produite'
        );
      });
    });

    it('button is disabled during location update process', async () => {
      const { getByText, queryByText } = render(
        <ProfileLocation
          profile={mockProfile}
          saving={false}
          onUpdateLocation={mockOnUpdateLocation}
        />
      );

      const updateButton = getByText('📍 Mettre à jour ma position');
      fireEvent.press(updateButton);

      // Vérifier que l'état de chargement est affiché (ce qui indique que le bouton est désactivé)
      await waitFor(() => {
        expect(queryByText('Localisation...')).toBeTruthy();
      });
    });
  });
}); 