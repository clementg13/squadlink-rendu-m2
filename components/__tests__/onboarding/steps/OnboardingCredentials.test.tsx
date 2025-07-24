import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

// Mock supabase
const mockSupabase = {
  auth: {
    signUp: jest.fn(),
  },
};

jest.mock('../../../../lib/supabase', () => ({
  supabase: mockSupabase,
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

import OnboardingCredentials from '../../../onboarding/steps/OnboardingCredentials';

const mockOnNext = jest.fn();

describe('OnboardingCredentials', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form elements correctly', () => {
    const { getByText, getByPlaceholderText } = render(
      <OnboardingCredentials onNext={mockOnNext} />
    );
    
    expect(getByText('Créez votre compte')).toBeTruthy();
    expect(getByPlaceholderText('votre@email.com')).toBeTruthy();
    expect(getByPlaceholderText('Minimum 6 caractères')).toBeTruthy();
    expect(getByPlaceholderText('Confirmez votre mot de passe')).toBeTruthy();
  });

  it('validates email format', async () => {
    const { getByPlaceholderText, getByText } = render(
      <OnboardingCredentials onNext={mockOnNext} />
    );

    fireEvent.changeText(getByPlaceholderText('votre@email.com'), 'invalid-email');
    fireEvent.changeText(getByPlaceholderText('Minimum 6 caractères'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirmez votre mot de passe'), 'password123');
    
    fireEvent.press(getByText('Créer mon compte'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Erreur de validation',
        expect.stringContaining('email')
      );
    });
  });

  it('validates password match', async () => {
    const { getByPlaceholderText, getByText } = render(
      <OnboardingCredentials onNext={mockOnNext} />
    );

    fireEvent.changeText(getByPlaceholderText('votre@email.com'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Minimum 6 caractères'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirmez votre mot de passe'), 'different123');
    
    fireEvent.press(getByText('Créer mon compte'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Erreur de validation',
        expect.stringContaining('correspondent pas')
      );
    });
  });

  it('handles signup errors', async () => {
    mockSupabase.auth.signUp.mockResolvedValue({
      data: null,
      error: { message: 'Email already exists' },
    });

    const { getByPlaceholderText, getByText } = render(
      <OnboardingCredentials onNext={mockOnNext} />
    );

    fireEvent.changeText(getByPlaceholderText('votre@email.com'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Minimum 6 caractères'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirmez votre mot de passe'), 'password123');
    
    fireEvent.press(getByText('Créer mon compte'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Erreur',
        'Une erreur inattendue est survenue'
      );
    });
  });
});