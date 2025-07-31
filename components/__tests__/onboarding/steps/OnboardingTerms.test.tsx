import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import OnboardingTerms from '../../../onboarding/steps/OnboardingTerms';

describe('OnboardingTerms', () => {
  it('renders all sections and titles', () => {
    const { getByText } = render(<OnboardingTerms onAccept={jest.fn()} onBack={jest.fn()} />);
    expect(getByText("Conditions d'utilisation")).toBeTruthy();
    expect(getByText('1. Acceptation des conditions')).toBeTruthy();
    expect(getByText('2. Utilisation du service')).toBeTruthy();
    expect(getByText('3. Compte utilisateur')).toBeTruthy();
    expect(getByText('4. Propriété intellectuelle')).toBeTruthy();
    expect(getByText('5. Modifications')).toBeTruthy();
  });

  it('calls onAccept when "J\'accepte" is pressed', () => {
    const onAccept = jest.fn();
    const { getByText } = render(<OnboardingTerms onAccept={onAccept} onBack={jest.fn()} />);
    fireEvent.press(getByText("J'accepte"));
    expect(onAccept).toHaveBeenCalled();
  });

  it('calls onBack when "Retour" is pressed', () => {
    const onBack = jest.fn();
    const { getByText } = render(<OnboardingTerms onAccept={jest.fn()} onBack={onBack} />);
    fireEvent.press(getByText('Retour'));
    expect(onBack).toHaveBeenCalled();
  });
});
