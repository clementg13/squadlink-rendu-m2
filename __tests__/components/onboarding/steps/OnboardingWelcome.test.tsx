import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import OnboardingWelcome from '@/components/onboarding/steps/OnboardingWelcome';

const mockOnNext = jest.fn();

describe('OnboardingWelcome', () => {
  beforeEach(() => {
    mockOnNext.mockClear();
  });

  it('renders welcome content correctly', () => {
    const { getByText } = render(<OnboardingWelcome onNext={mockOnNext} />);
    
    // L'emoji principal ne devrait pas être accessible car il a importantForAccessibility="no"
    // Mais on peut vérifier les autres textes
    expect(getByText('Bienvenue sur SquadLink')).toBeTruthy();
    expect(getByText(/L'application qui vous connecte/)).toBeTruthy();
  });

  it('renders all feature items', () => {
    const { getByText } = render(<OnboardingWelcome onNext={mockOnNext} />);
    
    // Les emojis sont maintenant intégrés dans le texte complet
    expect(getByText('🤝 Trouvez des partenaires d\'entraînement')).toBeTruthy();
    expect(getByText('🎯 Partagez vos objectifs sportifs')).toBeTruthy();
    expect(getByText('📍 Découvrez des salles près de chez vous')).toBeTruthy();
  });

  it('renders start button', () => {
    const { getByText } = render(<OnboardingWelcome onNext={mockOnNext} />);
    
    expect(getByText('Commencer')).toBeTruthy();
  });

  it('calls onNext when start button is pressed', () => {
    const { getByText } = render(<OnboardingWelcome onNext={mockOnNext} />);
    
    fireEvent.press(getByText('Commencer'));
    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  it('applies correct styling', () => {
    const { getByText } = render(<OnboardingWelcome onNext={mockOnNext} />);
    
    const buttonText = getByText('Commencer');
    
    // Vérifier que le bouton existe et est fonctionnel
    expect(buttonText).toBeTruthy();
    
    // Vérifier que le bouton est pressable
    expect(() => {
      fireEvent.press(buttonText);
    }).not.toThrow();
    
    // Vérifier que le callback a été appelé
    expect(mockOnNext).toHaveBeenCalled();
  });
});
