import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import OnboardingPrivacy from '../../../onboarding/steps/OnboardingPrivacy';

describe('OnboardingPrivacy', () => {
  it('renders all sections and titles', () => {
    const { getByText } = render(<OnboardingPrivacy onAccept={jest.fn()} onBack={jest.fn()} />);
    expect(getByText('Politique de confidentialité')).toBeTruthy();
    expect(getByText('1. Collecte des informations')).toBeTruthy();
    expect(getByText('2. Utilisation des informations')).toBeTruthy();
    expect(getByText('3. Partage des informations')).toBeTruthy();
    expect(getByText('4. Sécurité des données')).toBeTruthy();
    expect(getByText('5. Vos droits')).toBeTruthy();
    expect(getByText('6. Modifications')).toBeTruthy();
  });

  it('calls onAccept when "J\'accepte" is pressed', () => {
    const onAccept = jest.fn();
    const { getByText } = render(<OnboardingPrivacy onAccept={onAccept} onBack={jest.fn()} />);
    fireEvent.press(getByText("J'accepte"));
    expect(onAccept).toHaveBeenCalled();
  });

  it('calls onBack when "Retour" is pressed', () => {
    const onBack = jest.fn();
    const { getByText } = render(<OnboardingPrivacy onAccept={jest.fn()} onBack={onBack} />);
    fireEvent.press(getByText('Retour'));
    expect(onBack).toHaveBeenCalled();
  });
});
