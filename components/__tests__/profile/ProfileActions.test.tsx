import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProfileActions from '../../profile/ProfileActions';

const mockOnSave = jest.fn();
const mockOnCancel = jest.fn();
const mockOnSignOut = jest.fn();

describe('ProfileActions', () => {
  beforeEach(() => {
    mockOnSave.mockClear();
    mockOnCancel.mockClear();
    mockOnSignOut.mockClear();
  });

  it('renders save button', () => {
    const { getByText } = render(
      <ProfileActions
        hasChanges={false}
        saving={false}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onSignOut={mockOnSignOut}
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
        onSignOut={mockOnSignOut}
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
        onSignOut={mockOnSignOut}
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
        onSignOut={mockOnSignOut}
      />
    );

    fireEvent.press(getByText('Modifier profil'));
    expect(mockOnSave).toHaveBeenCalled();
  });

  it('disables buttons when saving', () => {
    const { getByTestId } = render(
      <ProfileActions
        hasChanges={true}
        saving={true}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onSignOut={mockOnSignOut}
      />
    );

    const saveButton = getByTestId('save-button');
    expect(saveButton.props.accessibilityState.disabled).toBe(true);
  });

  it('shows sign out button', () => {
    const { getByText } = render(
      <ProfileActions
        hasChanges={false}
        saving={false}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onSignOut={mockOnSignOut}
      />
    );

    expect(getByText('Se déconnecter')).toBeTruthy();
  });
});
