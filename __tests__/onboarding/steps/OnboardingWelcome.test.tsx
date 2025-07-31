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
    
    expect(getByText('🏋️‍♂️')).toBeTruthy();
    expect(getByText('Bienvenue sur SquadLink')).toBeTruthy();
    expect(getByText(/L'application qui vous connecte/)).toBeTruthy();
  });

  it('renders all feature items', () => {
    const { getByText } = render(<OnboardingWelcome onNext={mockOnNext} />);
    
    expect(getByText('🤝')).toBeTruthy();
    expect(getByText('Trouvez des partenaires d\'entraînement')).toBeTruthy();
    expect(getByText('🎯')).toBeTruthy();
    expect(getByText('Partagez vos objectifs sportifs')).toBeTruthy();
    expect(getByText('📍')).toBeTruthy();
    expect(getByText('Découvrez des salles près de chez vous')).toBeTruthy();
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
    
    // Vérifier le style du texte du bouton
    expect(buttonText.props.style).toEqual(
      expect.objectContaining({
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
      })
    );
    
    // Vérifier que le bouton a une structure correcte
    const buttonContainer = buttonText.parent;
    expect(buttonContainer).toBeTruthy();
    
    // Tenter de vérifier les styles du container parent s'ils existent
    const possibleButtonContainer = buttonContainer?.parent;
    if (possibleButtonContainer?.props?.style) {
      expect(possibleButtonContainer.props.style).toEqual(
        expect.objectContaining({
          backgroundColor: '#007AFF',
          borderRadius: 12,
        })
      );
    }
    
    // Test alternatif : vérifier que le bouton est pressable
    expect(() => {
      fireEvent.press(buttonText);
    }).not.toThrow();
  });
});
