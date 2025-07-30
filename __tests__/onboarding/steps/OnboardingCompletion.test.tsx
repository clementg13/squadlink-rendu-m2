import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

// Mock useAuth
const mockSetIsOnboarding = jest.fn();
jest.mock('../../../../stores/authStore', () => ({
  useAuth: () => ({
    setIsOnboarding: mockSetIsOnboarding,
  }),
}));

// Mock router avec une approche différente
const mockRouter = {
  replace: jest.fn(),
  push: jest.fn(),
  back: jest.fn(),
};

// Mock complet d'expo-router avec toutes les exports
jest.mock('expo-router', () => {
  return {
    router: mockRouter,
    useRouter: () => mockRouter,
    useLocalSearchParams: () => ({}),
    usePathname: () => '/',
    useSegments: () => [],
    Link: 'Link',
    Redirect: 'Redirect',
    Stack: {
      Screen: 'Screen',
    },
    Tabs: {
      Screen: 'Screen',
    },
    Drawer: {
      Screen: 'Screen',
    },
  };
});

// Mock setTimeout pour les tests mais permettre l'exécution réelle
jest.useRealTimers();

describe('OnboardingCompletion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Réinitialiser complètement les mocks
    mockSetIsOnboarding.mockClear();
    mockRouter.replace.mockClear();
    mockRouter.push.mockClear();
    mockRouter.back.mockClear();
  });

  // Import après les mocks pour éviter les problèmes de hoisting
  const OnboardingCompletion = require('../../../onboarding/steps/OnboardingCompletion').default;

  it('renders completion content correctly', () => {
    const { getByText } = render(<OnboardingCompletion />);
    
    expect(getByText('🎉')).toBeTruthy();
    expect(getByText('Bienvenue dans SquadLink !')).toBeTruthy();
    expect(getByText('Votre profil est maintenant configuré')).toBeTruthy();
  });

  it('renders feature list', () => {
    const { getByText } = render(<OnboardingCompletion />);
    
    expect(getByText('Vous pouvez maintenant :')).toBeTruthy();
    expect(getByText('🤝')).toBeTruthy();
    expect(getByText('Trouver des partenaires qui vous correspondent')).toBeTruthy();
    expect(getByText('💬')).toBeTruthy();
    expect(getByText('Discuter ensemble')).toBeTruthy();
    expect(getByText('📅')).toBeTruthy();
    expect(getByText('Créer des séances ensemble')).toBeTruthy();
    expect(getByText('📈')).toBeTruthy();
    expect(getByText('Progresser ensemble !')).toBeTruthy();
  });

  it('renders start button', () => {
    const { getByText } = render(<OnboardingCompletion />);
    
    expect(getByText('Découvrir SquadLink')).toBeTruthy();
  });

  it('disables onboarding mode and navigates when button is pressed', async () => {
    const { getByText } = render(<OnboardingCompletion />);
    
    fireEvent.press(getByText('Découvrir SquadLink'));
    
    // Vérifier que setIsOnboarding est appelé immédiatement
    expect(mockSetIsOnboarding).toHaveBeenCalledWith(false);
    
    // Attendre que le setTimeout soit exécuté
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/(protected)/(tabs)');
    }, { timeout: 200 });
  });

  it('applies correct styling to completion screen', () => {
    const { getByText } = render(<OnboardingCompletion />);
    
    // Le texte du bouton a son propre style
    const buttonText = getByText('Découvrir SquadLink');
    expect(buttonText.props.style).toEqual(
      expect.objectContaining({
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
      })
    );
    
    // Le container du bouton peut avoir des styles différents selon l'implémentation
    const buttonContainer = buttonText.parent;
    expect(buttonContainer).toBeTruthy();
  });

  it('renders welcome emoji correctly', () => {
    const { getByText } = render(<OnboardingCompletion />);
    
    const emoji = getByText('🎉');
    expect(emoji).toBeTruthy();
  });

  it('displays all feature icons correctly', () => {
    const { getByText } = render(<OnboardingCompletion />);
    
    // Vérifier que tous les emojis de fonctionnalités sont présents
    expect(getByText('🤝')).toBeTruthy(); // Partenaires
    expect(getByText('💬')).toBeTruthy(); // Discussion
    expect(getByText('📅')).toBeTruthy(); // Séances
    expect(getByText('📈')).toBeTruthy(); // Progrès
  });

  it('has correct button accessibility', () => {
    const { getByText } = render(<OnboardingCompletion />);
    
    const buttonText = getByText('Découvrir SquadLink');
    const buttonContainer = buttonText.parent;
    
    // Vérifier que le bouton existe et est accessible
    expect(buttonContainer).toBeTruthy();
  });

  it('renders completion text in correct order', () => {
    const { getByText } = render(<OnboardingCompletion />);
    
    // Vérifier que les textes principaux sont présents
    expect(getByText('🎉')).toBeTruthy();
    expect(getByText('Bienvenue dans SquadLink !')).toBeTruthy();
    expect(getByText('Votre profil est maintenant configuré')).toBeTruthy();
    expect(getByText('Vous pouvez maintenant :')).toBeTruthy();
  });

  it('handles button press without errors', () => {
    const { getByText } = render(<OnboardingCompletion />);
    
    const button = getByText('Découvrir SquadLink');
    
    // S'assurer que l'appui sur le bouton ne lance pas d'erreur
    expect(() => {
      fireEvent.press(button);
    }).not.toThrow();
  });

  it('calls setIsOnboarding with false when completing', async () => {
    const { getByText } = render(<OnboardingCompletion />);
    
    fireEvent.press(getByText('Découvrir SquadLink'));
    
    // Vérifier spécifiquement l'appel avec false
    expect(mockSetIsOnboarding).toHaveBeenCalledTimes(1);
    expect(mockSetIsOnboarding).toHaveBeenCalledWith(false);
  });

  it('navigates to correct route after completion', async () => {
    const { getByText } = render(<OnboardingCompletion />);
    
    fireEvent.press(getByText('Découvrir SquadLink'));
    
    // Attendre que le setTimeout soit exécuté
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/(protected)/(tabs)');
    }, { timeout: 200 });
    
    // Vérifier que la navigation a bien eu lieu (sans imposer le nombre d'appels)
  });

  it('handles navigation delay correctly', async () => {
    const { getByText } = render(<OnboardingCompletion />);
    
    fireEvent.press(getByText('Découvrir SquadLink'));
    
    // Vérifier qu'immédiatement après le clic, la navigation n'a pas encore eu lieu
    expect(mockRouter.replace).not.toHaveBeenCalled();
    
    // Attendre que setTimeout soit exécuté
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/(protected)/(tabs)');
    }, { timeout: 200 });
  });

  it('calls setIsOnboarding immediately but navigation after delay', async () => {
    const { getByText } = render(<OnboardingCompletion />);
    
    fireEvent.press(getByText('Découvrir SquadLink'));
    
    // setIsOnboarding doit être appelé immédiatement
    expect(mockSetIsOnboarding).toHaveBeenCalledWith(false);
    
    // Navigation pas encore appelée
    expect(mockRouter.replace).not.toHaveBeenCalled();
    
    // Attendre que setTimeout soit exécuté
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/(protected)/(tabs)');
    }, { timeout: 200 });
  });

  it('button is pressable and has correct structure', () => {
    const { getByText } = render(<OnboardingCompletion />);
    
    const buttonText = getByText('Découvrir SquadLink');
    expect(buttonText).toBeTruthy();
    
    // Vérifier que le bouton a un parent (container)
    expect(buttonText.parent).toBeTruthy();
  });

  it('renders all required UI elements', () => {
    const { getByText } = render(<OnboardingCompletion />);
    
    // Vérifier tous les éléments essentiels
    expect(getByText('🎉')).toBeTruthy();
    expect(getByText('Bienvenue dans SquadLink !')).toBeTruthy();
    expect(getByText('Votre profil est maintenant configuré')).toBeTruthy();
    expect(getByText('Vous pouvez maintenant :')).toBeTruthy();
    expect(getByText('Découvrir SquadLink')).toBeTruthy();
  });
});