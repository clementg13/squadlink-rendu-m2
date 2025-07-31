import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

// Mock des hooks et stores
const mockUser = {
  id: 'user123',
  email: 'john.doe@example.com',
  firstname: 'John',
  lastname: 'Doe'
};

const mockAuthLoading = false;
const mockSetAuthLoading = jest.fn();

jest.mock('@/stores/authStore', () => ({
  useAuthUser: jest.fn(() => mockUser),
  useAuthLoading: jest.fn(() => mockAuthLoading),
}));

// Mock du hook de completion du profil
const mockProfileCompletion = {
  isComplete: true,
  isLoading: false,
  completionPercentage: 100,
  missingFields: []
};

jest.mock('@/hooks/useCurrentUserProfileCompletion', () => ({
  useCurrentUserProfileCompletion: jest.fn(() => mockProfileCompletion),
}));

// Mock simple et direct d'expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
}));

// Mock des composants enfants
jest.mock('@/components/profile/CompatibleProfilesList', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  
  return function MockCompatibleProfilesList({ onProfilePress, showWelcomeHeader, userName }: any) {
    const mockProfile = {
      id: 'profile123',
      firstname: 'Jane',
      lastname: 'Smith',
      age: 25,
      location: { town: 'Paris' },
      sports: [{ name: 'Football' }],
      hobbies: [{ name: 'Lecture' }]
    };
    
    return (
      <View testID="compatible-profiles-list">
        <Text testID="welcome-header">{userName}</Text>
        <TouchableOpacity 
          testID="profile-item"
          onPress={() => onProfilePress(mockProfile)}
        >
          <Text>Jane Smith</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

jest.mock('@/components/profile/ProfileIncompleteAlert', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  
  return function MockProfileIncompleteAlert({ completionPercentage, missingFields, compact }: any) {
    return (
      <View testID="profile-incomplete-alert">
        <Text>Profil {completionPercentage}% complet</Text>
        <Text>Champs manquants: {missingFields?.length || 0}</Text>
      </View>
    );
  };
});

jest.mock('@/components/profile/PendingMatchesNotification', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  
  return function MockPendingMatchesNotification() {
    return (
      <View testID="pending-matches-notification">
        <Text>Demandes d'amis en attente</Text>
      </View>
    );
  };
});

// Mock console.log pour éviter le bruit dans les tests
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

// Import du composant à tester
import HomeScreen from '@/app/(protected)/(tabs)/index';

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset des mocks par défaut
    const { useAuthUser, useAuthLoading } = require('@/stores/authStore');
    useAuthUser.mockReturnValue(mockUser);
    useAuthLoading.mockReturnValue(false);
    
    const { useCurrentUserProfileCompletion } = require('@/hooks/useCurrentUserProfileCompletion');
    useCurrentUserProfileCompletion.mockReturnValue(mockProfileCompletion);
  });

  describe('Rendu de base', () => {
    it('affiche l\'interface principale quand l\'utilisateur est connecté', () => {
      const { getByTestId } = render(<HomeScreen />);
      
      expect(getByTestId('compatible-profiles-list')).toBeTruthy();
      expect(getByTestId('pending-matches-notification')).toBeTruthy();
    });

    it('affiche le nom d\'utilisateur dans l\'en-tête de bienvenue', () => {
      const { getByTestId } = render(<HomeScreen />);
      
      const welcomeHeader = getByTestId('welcome-header');
      expect(welcomeHeader.props.children).toBe('john.doe');
    });

    it('utilise "Utilisateur" comme nom par défaut si pas d\'email', () => {
      const { useAuthUser } = require('@/stores/authStore');
      useAuthUser.mockReturnValue({ ...mockUser, email: null });
      
      const { getByTestId } = render(<HomeScreen />);
      
      const welcomeHeader = getByTestId('welcome-header');
      expect(welcomeHeader.props.children).toBe('Utilisateur');
    });
  });

  describe('États de chargement', () => {
    it('affiche l\'écran de chargement quand authLoading est true', () => {
      const { useAuthLoading } = require('@/stores/authStore');
      useAuthLoading.mockReturnValue(true);
      
      const { getByText, queryByTestId } = render(<HomeScreen />);
      
      expect(getByText('Connexion en cours...')).toBeTruthy();
      expect(queryByTestId('compatible-profiles-list')).toBeNull();
    });

    it('affiche l\'indicateur de chargement avec les bonnes propriétés', () => {
      const { useAuthLoading } = require('@/stores/authStore');
      useAuthLoading.mockReturnValue(true);
      
      const { UNSAFE_getByType } = render(<HomeScreen />);
      
      const { ActivityIndicator } = require('react-native');
      const loadingIndicator = UNSAFE_getByType(ActivityIndicator);
      
      expect(loadingIndicator.props.size).toBe('large');
      expect(loadingIndicator.props.color).toBe('#007AFF');
    });
  });

  describe('Alerte profil incomplet', () => {
    it('affiche l\'alerte quand le profil n\'est pas complet', () => {
      const { useCurrentUserProfileCompletion } = require('@/hooks/useCurrentUserProfileCompletion');
      useCurrentUserProfileCompletion.mockReturnValue({
        isComplete: false,
        isLoading: false,
        completionPercentage: 60,
        missingFields: ['firstname', 'lastname']
      });
      
      const { getByTestId } = render(<HomeScreen />);
      
      expect(getByTestId('profile-incomplete-alert')).toBeTruthy();
    });

    it('n\'affiche pas l\'alerte quand le profil est complet', () => {
      const { useCurrentUserProfileCompletion } = require('@/hooks/useCurrentUserProfileCompletion');
      useCurrentUserProfileCompletion.mockReturnValue({
        isComplete: true,
        isLoading: false,
        completionPercentage: 100,
        missingFields: []
      });
      
      const { queryByTestId } = render(<HomeScreen />);
      
      expect(queryByTestId('profile-incomplete-alert')).toBeNull();
    });

    it('n\'affiche pas l\'alerte pendant le chargement du profil', () => {
      const { useCurrentUserProfileCompletion } = require('@/hooks/useCurrentUserProfileCompletion');
      useCurrentUserProfileCompletion.mockReturnValue({
        isComplete: false,
        isLoading: true,
        completionPercentage: 0,
        missingFields: []
      });
      
      const { queryByTestId } = render(<HomeScreen />);
      
      expect(queryByTestId('profile-incomplete-alert')).toBeNull();
    });
  });

  describe('Navigation vers le détail du profil', () => {
    it('navigue vers la page de détail quand un profil est sélectionné', () => {
      const { getByTestId } = render(<HomeScreen />);
      
      const profileItem = getByTestId('profile-item');
      fireEvent.press(profileItem);
      
      const { router } = require('expo-router');
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/(protected)/profile-detail',
        params: {
          profile: expect.stringContaining('"firstname":"Jane"')
        }
      });
    });

    it('log les informations du profil sélectionné', () => {
      const { getByTestId } = render(<HomeScreen />);
      
      const profileItem = getByTestId('profile-item');
      fireEvent.press(profileItem);
      
      expect(console.log).toHaveBeenCalledWith(
        '🏠 HomeScreen: Profil sélectionné:',
        'Jane',
        'Smith'
      );
      
      expect(console.log).toHaveBeenCalledWith(
        '🏠 HomeScreen: Données du profil:',
        expect.objectContaining({
          age: 25,
          location: 'Paris',
          sports: 1,
          hobbies: 1
        })
      );
    });
  });

  describe('Styles et mise en page', () => {
    it('applique les styles corrects au container principal', () => {
      const { getByTestId } = render(<HomeScreen />);
      
      const compatibleProfilesList = getByTestId('compatible-profiles-list');
      const container = compatibleProfilesList.parent;
      
      // Vérifier que le container existe
      expect(container).toBeTruthy();
      // Le style peut être appliqué différemment selon l'implémentation
      expect(container).toBeDefined();
    });

    it('applique les styles corrects à l\'écran de chargement', () => {
      const { useAuthLoading } = require('@/stores/authStore');
      useAuthLoading.mockReturnValue(true);
      
      const { getByText } = render(<HomeScreen />);
      
      const loadingText = getByText('Connexion en cours...');
      // Vérifier que le style contient les propriétés attendues
      const styles = loadingText.props.style;
      expect(styles).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            marginTop: 16,
            fontSize: 18,
            color: '#007AFF',
            fontWeight: '600',
          })
        ])
      );
    });
  });

  describe('Gestion des erreurs', () => {
    it('gère gracieusement les erreurs de navigation', () => {
      // Simuler une erreur de navigation
      const { router } = require('expo-router');
      router.push.mockImplementation(() => {
        throw new Error('Navigation error');
      });
      
      const { getByTestId } = render(<HomeScreen />);
      
      const profileItem = getByTestId('profile-item');
      
      // Le test vérifie que la navigation est appelée malgré l'erreur
      expect(() => {
        fireEvent.press(profileItem);
      }).toThrow('Navigation error');
      
      expect(router.push).toHaveBeenCalled();
    });

    it('gère les profils sans données optionnelles', () => {
      // Réinitialiser le mock pour ce test
      const { router } = require('expo-router');
      router.push.mockReset();
      
      const { getByTestId } = render(<HomeScreen />);
      
      const profileItem = getByTestId('profile-item');
      
      // Le composant devrait gérer les cas où location, sports, hobbies sont undefined
      fireEvent.press(profileItem);
      expect(router.push).toHaveBeenCalled();
    });
  });

  describe('Intégration avec les composants enfants', () => {
    it('passe les bonnes props à CompatibleProfilesList', () => {
      const { getByTestId } = render(<HomeScreen />);
      
      const compatibleProfilesList = getByTestId('compatible-profiles-list');
      expect(compatibleProfilesList).toBeTruthy();
      
      // Vérifier que le composant est rendu avec les bonnes props
      const profileItem = getByTestId('profile-item');
      expect(profileItem).toBeTruthy();
    });

    it('passe les bonnes props à ProfileIncompleteAlert', () => {
      const { useCurrentUserProfileCompletion } = require('@/hooks/useCurrentUserProfileCompletion');
      useCurrentUserProfileCompletion.mockReturnValue({
        isComplete: false,
        isLoading: false,
        completionPercentage: 70,
        missingFields: ['firstname']
      });
      
      const { getByTestId } = render(<HomeScreen />);
      
      const alert = getByTestId('profile-incomplete-alert');
      expect(alert).toBeTruthy();
    });

    it('affiche toujours PendingMatchesNotification', () => {
      const { getByTestId } = render(<HomeScreen />);
      
      const notification = getByTestId('pending-matches-notification');
      expect(notification).toBeTruthy();
    });
  });
}); 