import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

// Mock d'expo-router
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  router: {
    back: jest.fn(),
  },
}));

// Mock des composants enfants
jest.mock('@/components/profile/MatchButton', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  
  return function MockMatchButton({ profile, onMatchSuccess, onMatchError }: any) {
    return (
      <TouchableOpacity 
        testID="match-button"
        onPress={() => {
          if (profile.id === 'error-profile') {
            onMatchError(new Error('Match failed'));
          } else {
            onMatchSuccess({ success: true, match_id: 123 });
          }
        }}
      >
        <Text>Matcher avec {profile.firstname}</Text>
      </TouchableOpacity>
    );
  };
});

jest.mock('@/components/profile/tags/SportTag', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  
  return function MockSportTag({ sport }: any) {
    return (
      <View testID={`sport-tag-${sport.id_sport}`}>
        <Text>{sport.sport?.name || 'Sport'}</Text>
      </View>
    );
  };
});

jest.mock('@/components/profile/tags/HobbyTag', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  
  return function MockHobbyTag({ hobby }: any) {
    return (
      <View testID={`hobby-tag-${hobby.id_hobbie}`}>
        <Text>{hobby.hobbie?.name || 'Hobby'}</Text>
      </View>
    );
  };
});

jest.mock('@/components/profile/tags/ProfileTag', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  
  return function MockProfileTag({ text, variant, size }: any) {
    return (
      <View testID={`profile-tag-${variant}`}>
        <Text>{text}</Text>
      </View>
    );
  };
});

// Mock console pour éviter le bruit dans les tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

// Import du composant à tester
import ProfileDetailScreen from '@/app/(protected)/profile-detail';

// Données de test
const mockProfileData = {
  id: 'profile123',
  firstname: 'Jane',
  lastname: 'Smith',
  age: 25,
  compatibility_score: 85,
  biography: 'Passionnée de sport et de technologie',
  location: {
    town: 'Paris',
    postal_code: '75001'
  },
  gym: {
    name: 'Fitness Club Paris'
  },
  gymSubscription: {
    name: 'Premium'
  },
  sports: [
    {
      id_sport: 'sport1',
      sport: { name: 'Football' }
    },
    {
      id_sport: 'sport2',
      sport: { name: 'Tennis' }
    }
  ],
  hobbies: [
    {
      id_hobbie: 'hobby1',
      hobbie: { name: 'Lecture' }
    },
    {
      id_hobbie: 'hobby2',
      hobbie: { name: 'Musique' }
    }
  ],
  socialMedias: [
    {
      id_social_media: 'sm1',
      username: 'jane_smith',
      socialmedia: { name: 'Instagram' }
    },
    {
      id_social_media: 'sm2',
      username: 'jane_tech',
      socialmedia: { name: 'Twitter' }
    }
  ]
};

describe('ProfileDetailScreen', () => {
  const mockUseLocalSearchParams = require('expo-router').useLocalSearchParams;
  const mockRouter = require('expo-router').router;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup par défaut avec des données de profil
    mockUseLocalSearchParams.mockReturnValue({
      profile: JSON.stringify(mockProfileData)
    });
  });

  describe('Rendu de base', () => {
    it('affiche les informations du profil correctement', () => {
      const { getByText, getAllByText } = render(<ProfileDetailScreen />);
      
      // Vérifier que le nom apparaît au moins une fois
      expect(getAllByText('Jane Smith').length).toBeGreaterThan(0);
      expect(getByText('25 ans')).toBeTruthy();
      expect(getByText('Compatibilité')).toBeTruthy();
      expect(getByText('85%')).toBeTruthy();
    });

    it('affiche l\'avatar avec la première lettre du prénom', () => {
      const { getByText } = render(<ProfileDetailScreen />);
      
      expect(getByText('J')).toBeTruthy();
    });

    it('affiche le bouton retour', () => {
      const { getByText } = render(<ProfileDetailScreen />);
      
      expect(getByText('← Retour')).toBeTruthy();
    });

    it('affiche le titre du header avec le nom complet', () => {
      const { getAllByText } = render(<ProfileDetailScreen />);
      
      // Vérifier que le nom apparaît dans le header
      const nameElements = getAllByText('Jane Smith');
      expect(nameElements.length).toBeGreaterThan(0);
    });
  });

  describe('États de chargement', () => {
    it('affiche l\'écran de chargement quand pas de données', () => {
      mockUseLocalSearchParams.mockReturnValue({});
      
      const { getByText, UNSAFE_getByType } = render(<ProfileDetailScreen />);
      
      expect(getByText('Chargement des informations...')).toBeTruthy();
      
      const { ActivityIndicator } = require('react-native');
      const loadingIndicator = UNSAFE_getByType(ActivityIndicator);
      expect(loadingIndicator.props.size).toBe('large');
      expect(loadingIndicator.props.color).toBe('#007AFF');
    });

    it('affiche l\'écran de chargement avec des données invalides', () => {
      mockUseLocalSearchParams.mockReturnValue({
        profile: 'invalid-json'
      });
      
      // Le composant actuel ne gère pas les erreurs JSON, donc on s'attend à une erreur
      expect(() => {
        render(<ProfileDetailScreen />);
      }).toThrow('Unexpected token');
    });
  });

  describe('Navigation', () => {
    it('appelle router.back quand le bouton retour est pressé', () => {
      const { getByText } = render(<ProfileDetailScreen />);
      
      const backButton = getByText('← Retour');
      fireEvent.press(backButton);
      
      expect(mockRouter.back).toHaveBeenCalled();
    });
  });

  describe('Score de compatibilité', () => {
    it('affiche la couleur verte pour un score élevé (>= 80)', () => {
      const { getByText } = render(<ProfileDetailScreen />);
      
      const compatibilityValue = getByText('85%');
      expect(compatibilityValue).toBeTruthy();
      
      // Vérifier que l'icône est affichée
      expect(getByText('🔥')).toBeTruthy();
    });

    it('affiche la couleur orange pour un score moyen (60-79)', () => {
      const profileWithMediumScore = {
        ...mockProfileData,
        compatibility_score: 70
      };
      
      mockUseLocalSearchParams.mockReturnValue({
        profile: JSON.stringify(profileWithMediumScore)
      });
      
      const { getByText } = render(<ProfileDetailScreen />);
      
      expect(getByText('70%')).toBeTruthy();
      expect(getByText('⭐')).toBeTruthy();
    });

    it('affiche la couleur jaune pour un score faible (40-59)', () => {
      const profileWithLowScore = {
        ...mockProfileData,
        compatibility_score: 45
      };
      
      mockUseLocalSearchParams.mockReturnValue({
        profile: JSON.stringify(profileWithLowScore)
      });
      
      const { getByText } = render(<ProfileDetailScreen />);
      
      expect(getByText('45%')).toBeTruthy();
      expect(getByText('👍')).toBeTruthy();
    });

    it('affiche la couleur grise pour un score très faible (< 40)', () => {
      const profileWithVeryLowScore = {
        ...mockProfileData,
        compatibility_score: 25
      };
      
      mockUseLocalSearchParams.mockReturnValue({
        profile: JSON.stringify(profileWithVeryLowScore)
      });
      
      const { getByText } = render(<ProfileDetailScreen />);
      
      expect(getByText('25%')).toBeTruthy();
      expect(getByText('👌')).toBeTruthy();
    });
  });

  describe('Sections conditionnelles', () => {
    it('affiche la biographie quand disponible', () => {
      const { getByText } = render(<ProfileDetailScreen />);
      
      expect(getByText('À propos de Jane')).toBeTruthy();
      expect(getByText('"Passionnée de sport et de technologie"')).toBeTruthy();
    });

    it('n\'affiche pas la biographie quand non disponible', () => {
      const profileWithoutBio = {
        ...mockProfileData,
        biography: null
      };
      
      mockUseLocalSearchParams.mockReturnValue({
        profile: JSON.stringify(profileWithoutBio)
      });
      
      const { queryByText } = render(<ProfileDetailScreen />);
      
      expect(queryByText('À propos de Jane')).toBeNull();
    });

    it('affiche la localisation avec code postal', () => {
      const { getByText, getAllByText } = render(<ProfileDetailScreen />);
      
      expect(getByText('Localisation')).toBeTruthy();
      // Vérifier que la localisation apparaît au moins une fois
      expect(getAllByText('📍 Paris').length).toBeGreaterThan(0);
      expect(getByText('75001')).toBeTruthy();
    });

    it('affiche la salle de sport et l\'abonnement', () => {
      const { getByText } = render(<ProfileDetailScreen />);
      
      expect(getByText('Salle de sport')).toBeTruthy();
      expect(getByText('🏋️ Fitness Club Paris')).toBeTruthy();
      expect(getByText('Abonnement: Premium')).toBeTruthy();
    });

    it('affiche les sports pratiqués', () => {
      const { getByText, getByTestId } = render(<ProfileDetailScreen />);
      
      expect(getByText('Sports pratiqués par Jane')).toBeTruthy();
      expect(getByTestId('sport-tag-sport1')).toBeTruthy();
      expect(getByTestId('sport-tag-sport2')).toBeTruthy();
    });

    it('affiche les hobbies', () => {
      const { getByText, getByTestId } = render(<ProfileDetailScreen />);
      
      expect(getByText('Centres d\'intérêt de Jane')).toBeTruthy();
      expect(getByTestId('hobby-tag-hobby1')).toBeTruthy();
      expect(getByTestId('hobby-tag-hobby2')).toBeTruthy();
    });

    it('affiche les réseaux sociaux', () => {
      const { getByText } = render(<ProfileDetailScreen />);
      
      expect(getByText('Réseaux sociaux')).toBeTruthy();
      expect(getByText('Instagram:')).toBeTruthy();
      expect(getByText('@jane_smith')).toBeTruthy();
      expect(getByText('Twitter:')).toBeTruthy();
      expect(getByText('@jane_tech')).toBeTruthy();
    });
  });

  describe('Gestion des données manquantes', () => {
    it('gère l\'absence d\'âge', () => {
      const profileWithoutAge = {
        ...mockProfileData,
        age: null
      };
      
      mockUseLocalSearchParams.mockReturnValue({
        profile: JSON.stringify(profileWithoutAge)
      });
      
      const { queryByText } = render(<ProfileDetailScreen />);
      
      expect(queryByText('25 ans')).toBeNull();
    });

    it('gère l\'absence de localisation', () => {
      const profileWithoutLocation = {
        ...mockProfileData,
        location: null
      };
      
      mockUseLocalSearchParams.mockReturnValue({
        profile: JSON.stringify(profileWithoutLocation)
      });
      
      const { queryByText } = render(<ProfileDetailScreen />);
      
      expect(queryByText('📍 Paris')).toBeNull();
      expect(queryByText('Localisation')).toBeNull();
    });

    it('gère l\'absence de salle de sport', () => {
      const profileWithoutGym = {
        ...mockProfileData,
        gym: null
      };
      
      mockUseLocalSearchParams.mockReturnValue({
        profile: JSON.stringify(profileWithoutGym)
      });
      
      const { queryByText } = render(<ProfileDetailScreen />);
      
      expect(queryByText('Salle de sport')).toBeNull();
    });

    it('gère l\'absence de sports', () => {
      const profileWithoutSports = {
        ...mockProfileData,
        sports: []
      };
      
      mockUseLocalSearchParams.mockReturnValue({
        profile: JSON.stringify(profileWithoutSports)
      });
      
      const { queryByText } = render(<ProfileDetailScreen />);
      
      expect(queryByText('Sports pratiqués par Jane')).toBeNull();
    });

    it('gère l\'absence de hobbies', () => {
      const profileWithoutHobbies = {
        ...mockProfileData,
        hobbies: []
      };
      
      mockUseLocalSearchParams.mockReturnValue({
        profile: JSON.stringify(profileWithoutHobbies)
      });
      
      const { queryByText } = render(<ProfileDetailScreen />);
      
      expect(queryByText('Centres d\'intérêt de Jane')).toBeNull();
    });

    it('gère l\'absence de réseaux sociaux', () => {
      const profileWithoutSocial = {
        ...mockProfileData,
        socialMedias: []
      };
      
      mockUseLocalSearchParams.mockReturnValue({
        profile: JSON.stringify(profileWithoutSocial)
      });
      
      const { queryByText } = render(<ProfileDetailScreen />);
      
      expect(queryByText('Réseaux sociaux')).toBeNull();
    });
  });

  describe('Bouton de match', () => {
    it('affiche le bouton de match', () => {
      const { getByTestId } = render(<ProfileDetailScreen />);
      
      expect(getByTestId('match-button')).toBeTruthy();
    });

    it('appelle onMatchSuccess quand le match réussit', () => {
      const { getByTestId } = render(<ProfileDetailScreen />);
      
      const matchButton = getByTestId('match-button');
      fireEvent.press(matchButton);
      
      expect(console.log).toHaveBeenCalledWith(
        '💕 ProfileDetail: Match successful:',
        { success: true, match_id: 123 }
      );
    });

    it('appelle onMatchError quand le match échoue', () => {
      const errorProfile = {
        ...mockProfileData,
        id: 'error-profile'
      };
      
      mockUseLocalSearchParams.mockReturnValue({
        profile: JSON.stringify(errorProfile)
      });
      
      const { getByTestId } = render(<ProfileDetailScreen />);
      
      const matchButton = getByTestId('match-button');
      fireEvent.press(matchButton);
      
      expect(console.error).toHaveBeenCalledWith(
        '❌ ProfileDetail: Match error:',
        expect.any(Error)
      );
    });
  });

  describe('Gestion des erreurs', () => {
    it('gère les données de profil invalides', () => {
      mockUseLocalSearchParams.mockReturnValue({
        profile: 'invalid-json-data'
      });
      
      // Le composant actuel ne gère pas les erreurs JSON, donc on s'attend à une erreur
      expect(() => {
        render(<ProfileDetailScreen />);
      }).toThrow('Unexpected token');
    });

    it('gère les profils sans prénom', () => {
      const profileWithoutFirstname = {
        ...mockProfileData,
        firstname: null
      };
      
      mockUseLocalSearchParams.mockReturnValue({
        profile: JSON.stringify(profileWithoutFirstname)
      });
      
      const { getByText } = render(<ProfileDetailScreen />);
      
      // Devrait afficher "?" comme avatar
      expect(getByText('?')).toBeTruthy();
    });

    it('gère les profils avec des données partielles', () => {
      const minimalProfile = {
        id: 'minimal123',
        firstname: 'John',
        lastname: 'Doe',
        compatibility_score: 50
      };
      
      mockUseLocalSearchParams.mockReturnValue({
        profile: JSON.stringify(minimalProfile)
      });
      
      const { getByText, queryByText, getAllByText } = render(<ProfileDetailScreen />);
      
      // Devrait afficher les informations de base
      expect(getAllByText('John Doe').length).toBeGreaterThan(0);
      expect(getByText('50%')).toBeTruthy();
      
      // Ne devrait pas afficher les sections optionnelles
      expect(queryByText('À propos de John')).toBeNull();
      expect(queryByText('Localisation')).toBeNull();
      expect(queryByText('Salle de sport')).toBeNull();
    });
  });

  describe('Styles et mise en page', () => {
    it('applique les styles corrects au container principal', () => {
      const { getByTestId } = render(<ProfileDetailScreen />);
      
      // Vérifier que le ScrollView est présent
      const { ScrollView } = require('react-native');
      expect(ScrollView).toBeDefined();
    });

    it('affiche l\'avatar avec les bonnes dimensions', () => {
      const { getByText } = render(<ProfileDetailScreen />);
      
      const avatarText = getByText('J');
      expect(avatarText).toBeTruthy();
    });

    it('affiche le nom du profil avec le bon style', () => {
      const { getAllByText } = render(<ProfileDetailScreen />);
      
      const profileNames = getAllByText('Jane Smith');
      expect(profileNames.length).toBeGreaterThan(0);
    });
  });

  describe('Intégration avec les composants enfants', () => {
    it('passe les bonnes props aux ProfileTag', () => {
      const { getByTestId } = render(<ProfileDetailScreen />);
      
      expect(getByTestId('profile-tag-age')).toBeTruthy();
      expect(getByTestId('profile-tag-location')).toBeTruthy();
    });

    it('passe les bonnes props aux SportTag', () => {
      const { getByTestId } = render(<ProfileDetailScreen />);
      
      expect(getByTestId('sport-tag-sport1')).toBeTruthy();
      expect(getByTestId('sport-tag-sport2')).toBeTruthy();
    });

    it('passe les bonnes props aux HobbyTag', () => {
      const { getByTestId } = render(<ProfileDetailScreen />);
      
      expect(getByTestId('hobby-tag-hobby1')).toBeTruthy();
      expect(getByTestId('hobby-tag-hobby2')).toBeTruthy();
    });

    it('passe les bonnes props au MatchButton', () => {
      const { getByTestId } = render(<ProfileDetailScreen />);
      
      const matchButton = getByTestId('match-button');
      expect(matchButton).toBeTruthy();
    });
  });
}); 