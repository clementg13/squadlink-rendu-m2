import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock authStore
const mockSignOut = jest.fn();
jest.mock('../../../stores/authStore', () => ({
  useAuth: jest.fn(() => ({
    user: null,
    session: null,
    signOut: mockSignOut,
  })),
}));

// Mock useRouter
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
  })),
}));

// Mock supabase
jest.mock('../../../lib/supabase', () => ({
  supabase: {
    auth: {
      signOut: jest.fn(),
    },
  },
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock profileService.deleteAccountAndData directement
jest.mock('../../../services/profileService', () => ({
  profileService: {
    deleteAccountAndData: jest.fn(),
  },
}));

import ProfileActions from '../../profile/ProfileActions';
import { profileService } from '../../../services/profileService';

const mockOnSave = jest.fn();
const mockOnCancel = jest.fn();

describe('ProfileActions', () => {
  beforeEach(() => {
    mockOnSave.mockClear();
    mockOnCancel.mockClear();
    mockSignOut.mockClear();
    (Alert.alert as jest.Mock).mockClear();
  });

  it('renders save button', () => {
    const { getByText } = render(
      <ProfileActions
        hasChanges={false}
        saving={false}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(getByText('Modifier profil')).toBeTruthy();
  });

  it('shows cancel button when has changes', () => {
    const { getByText } = render(
      <ProfileActions
        hasChanges={true}
        saving={false}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(getByText('Annuler')).toBeTruthy();
  });

  it('hides cancel button when no changes', () => {
    const { queryByText } = render(
      <ProfileActions
        hasChanges={false}
        saving={false}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(queryByText('Annuler')).toBeNull();
  });

  it('calls onSave when save button pressed', () => {
    const { getByText } = render(
      <ProfileActions
        hasChanges={true}
        saving={false}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.press(getByText('Enregistrer'));
    expect(mockOnSave).toHaveBeenCalled();
  });

  it('disables buttons when saving', () => {
    const { getByTestId } = render(
      <ProfileActions
        hasChanges={true}
        saving={true}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const saveButton = getByTestId('save-button');
    // Check if the button is disabled via accessibilityState
    expect(saveButton.props.accessibilityState.disabled).toBe(true);
  });

  it('shows sign out button', () => {
    const { getByText } = render(
      <ProfileActions
        hasChanges={false}
        saving={false}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(getByText('🚪 Se déconnecter')).toBeTruthy();
  });

  it('shows confirmation dialog when sign out button is pressed', () => {
    const { getByText } = render(
      <ProfileActions
        hasChanges={false}
        saving={false}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.press(getByText('🚪 Se déconnecter'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      expect.arrayContaining([
        expect.objectContaining({ text: 'Annuler', style: 'cancel' }),
        expect.objectContaining({
          text: 'Déconnecter',
          style: 'destructive',
          onPress: expect.any(Function),
        }),
      ])
    );
  });

  it('calls signOut when confirmation is accepted', async () => {
    mockSignOut.mockResolvedValue({ error: null });

    const { getByText } = render(
      <ProfileActions
        hasChanges={false}
        saving={false}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.press(getByText('🚪 Se déconnecter'));

    // Simuler l'appui sur "Déconnecter" dans l'alerte
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const confirmButton = alertCall[2].find((button: any) => button.text === 'Déconnecter');

    await confirmButton.onPress();

    expect(mockSignOut).toHaveBeenCalled();
  });

  it('handles sign out error', async () => {
    const errorMessage = 'Network error';
    mockSignOut.mockRejectedValue(new Error(errorMessage));

    const { getByText } = render(
      <ProfileActions
        hasChanges={false}
        saving={false}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.press(getByText('🚪 Se déconnecter'));

    // Simuler l'appui sur "Déconnecter" dans l'alerte
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const confirmButton = alertCall[2].find((button: any) => button.text === 'Déconnecter');

    await confirmButton.onPress();

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Une erreur s\'est produite lors de la déconnexion');
    });
  });
  
  it('does not call signOut when cancel is pressed in confirmation', () => {
    const { getByText } = render(
      <ProfileActions
        hasChanges={false}
        saving={false}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.press(getByText('🚪 Se déconnecter'));

    // Vérifier que l'alerte est affichée mais ne pas simuler de clic sur "Déconnecter"
    expect(Alert.alert).toHaveBeenCalled();
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  it('shows loading indicator when saving', () => {
    const { UNSAFE_getByType } = render(
      <ProfileActions
        hasChanges={true}
        saving={true}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const { ActivityIndicator } = require('react-native');
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('shows correct button text based on hasChanges state', () => {
    const { getByText, rerender } = render(
      <ProfileActions
        hasChanges={false}
        saving={false}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(getByText('Modifier profil')).toBeTruthy();

    rerender(
      <ProfileActions
        hasChanges={true}
        saving={false}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    expect(getByText('Enregistrer')).toBeTruthy();
  });

  it('shows delete account button', () => {
    const { getByText } = render(
      <ProfileActions
        hasChanges={false}
        saving={false}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    expect(getByText('🗑️ Supprimer mon compte')).toBeTruthy();
  });

  it('shows confirmation dialog when delete account button is pressed', () => {
    const { getByText } = render(
      <ProfileActions
        hasChanges={false}
        saving={false}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    fireEvent.press(getByText('🗑️ Supprimer mon compte'));
    expect(Alert.alert).toHaveBeenCalledWith(
      'Suppression du compte',
      expect.stringContaining('Êtes-vous sûr de vouloir supprimer définitivement votre compte'),
      expect.arrayContaining([
        expect.objectContaining({ text: 'Annuler', style: 'cancel' }),
        expect.objectContaining({
          text: 'Supprimer',
          style: 'destructive',
          onPress: expect.any(Function),
        }),
      ])
    );
  });

  it('calls profileService.deleteAccountAndData and signOut on confirm', async () => {
    (profileService.deleteAccountAndData as jest.Mock).mockResolvedValue({});
    mockSignOut.mockResolvedValue({ error: null });

    const { getByText } = render(
      <ProfileActions
        hasChanges={false}
        saving={false}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    fireEvent.press(getByText('🗑️ Supprimer mon compte'));
    const alertCall = (Alert.alert as jest.Mock).mock.calls.find(call => call[0] === 'Suppression du compte');
    const confirmButton = alertCall[2].find((button: any) => button.text === 'Supprimer');
    await confirmButton.onPress();
    expect(profileService.deleteAccountAndData).toHaveBeenCalled();
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('shows error if deleteAccountAndData returns error', async () => {
    (profileService.deleteAccountAndData as jest.Mock).mockResolvedValue({ error: 'Erreur suppression' });

    const { getByText } = render(
      <ProfileActions
        hasChanges={false}
        saving={false}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    fireEvent.press(getByText('🗑️ Supprimer mon compte'));
    const alertCall = (Alert.alert as jest.Mock).mock.calls.find(call => call[0] === 'Suppression du compte');
    const confirmButton = alertCall[2].find((button: any) => button.text === 'Supprimer');
    await confirmButton.onPress();
    expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Erreur suppression');
  });

  it('shows success alert if deleteAccountAndData succeeds', async () => {
    (profileService.deleteAccountAndData as jest.Mock).mockResolvedValue({});
    mockSignOut.mockResolvedValue({ error: null });

    const { getByText } = render(
      <ProfileActions
        hasChanges={false}
        saving={false}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    fireEvent.press(getByText('🗑️ Supprimer mon compte'));
    const alertCall = (Alert.alert as jest.Mock).mock.calls.find(call => call[0] === 'Suppression du compte');
    const confirmButton = alertCall[2].find((button: any) => button.text === 'Supprimer');
    await confirmButton.onPress();
    expect(Alert.alert).toHaveBeenCalledWith('Compte supprimé', expect.stringContaining('Votre compte et vos données ont été supprimés.'));
  });
});