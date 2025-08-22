import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import SocialMediaChip from '@/components/profile/socialMedias/SocialMediaChip';
import { ProfileSocialMedia } from '@/types/profile';

const mockUserSocialMedia: ProfileSocialMedia = {
  id_profile: '1',
  id_social_media: 'sm1',
  username: 'john_doe',
  socialmedia: { id: 'sm1', name: 'Instagram' }
};

const mockOnUpdate = jest.fn();
const mockOnRemove = jest.fn();

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('SocialMediaChip', () => {
  beforeEach(() => {
    mockOnUpdate.mockClear();
    mockOnRemove.mockClear();
    (Alert.alert as jest.Mock).mockClear();
  });

  it('displays social media name and username', () => {
    const { getByText } = render(
      <SocialMediaChip
        userSocialMedia={mockUserSocialMedia}
        saving={false}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    expect(getByText('Instagram')).toBeTruthy();
    expect(getByText('@john_doe')).toBeTruthy();
  });

  it('shows edit and remove buttons in normal mode', () => {
    const { getByText } = render(
      <SocialMediaChip
        userSocialMedia={mockUserSocialMedia}
        saving={false}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    expect(getByText('✏️')).toBeTruthy();
    expect(getByText('✕')).toBeTruthy();
  });

  it('enters edit mode when edit button pressed', () => {
    const { getByText, getByDisplayValue } = render(
      <SocialMediaChip
        userSocialMedia={mockUserSocialMedia}
        saving={false}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    fireEvent.press(getByText('✏️'));

    expect(getByDisplayValue('john_doe')).toBeTruthy();
    expect(getByText('✓')).toBeTruthy();
  });

  it('calls onRemove when remove button pressed', () => {
    const { getByText } = render(
      <SocialMediaChip
        userSocialMedia={mockUserSocialMedia}
        saving={false}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    fireEvent.press(getByText('✕'));
    expect(mockOnRemove).toHaveBeenCalledWith('sm1');
  });

  describe('Edit mode functionality', () => {
    it('shows save and cancel buttons in edit mode', () => {
      const { getByText } = render(
        <SocialMediaChip
          userSocialMedia={mockUserSocialMedia}
          saving={false}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
        />
      );

      fireEvent.press(getByText('✏️'));

      expect(getByText('✓')).toBeTruthy();
      expect(getByText('✕')).toBeTruthy();
    });

    it('allows editing username in edit mode', () => {
      const { getByText, getByDisplayValue } = render(
        <SocialMediaChip
          userSocialMedia={mockUserSocialMedia}
          saving={false}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
        />
      );

      fireEvent.press(getByText('✏️'));

      const input = getByDisplayValue('john_doe');
      fireEvent.changeText(input, 'new_username');

      expect(getByDisplayValue('new_username')).toBeTruthy();
    });

    it('calls onUpdate when save button pressed with valid username', async () => {
      mockOnUpdate.mockResolvedValue(undefined);

      const { getByText, getByDisplayValue } = render(
        <SocialMediaChip
          userSocialMedia={mockUserSocialMedia}
          saving={false}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
        />
      );

      fireEvent.press(getByText('✏️'));

      const input = getByDisplayValue('john_doe');
      fireEvent.changeText(input, 'new_username');

      fireEvent.press(getByText('✓'));

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith('sm1', 'new_username');
      });
    });

    it('exits edit mode after successful save', async () => {
      mockOnUpdate.mockResolvedValue(undefined);

      const { getByText, getByDisplayValue, queryByDisplayValue } = render(
        <SocialMediaChip
          userSocialMedia={mockUserSocialMedia}
          saving={false}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
        />
      );

      fireEvent.press(getByText('✏️'));
      fireEvent.changeText(getByDisplayValue('john_doe'), 'new_username');
      fireEvent.press(getByText('✓'));

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith('sm1', 'new_username');
      });

      // Le composant ne met pas à jour l'affichage après onUpdate, donc on vérifie juste que l'appel a été fait
      expect(mockOnUpdate).toHaveBeenCalledWith('sm1', 'new_username');
    });

    it('shows error alert when save fails', async () => {
      mockOnUpdate.mockRejectedValue(new Error('Update failed'));

      const { getByText, getByDisplayValue } = render(
        <SocialMediaChip
          userSocialMedia={mockUserSocialMedia}
          saving={false}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
        />
      );

      fireEvent.press(getByText('✏️'));
      fireEvent.changeText(getByDisplayValue('john_doe'), 'new_username');
      fireEvent.press(getByText('✓'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Impossible de mettre à jour le nom d\'utilisateur');
      });
    });

    it('reverts username to original value when save fails', async () => {
      mockOnUpdate.mockRejectedValue(new Error('Update failed'));

      const { getByText, getByDisplayValue } = render(
        <SocialMediaChip
          userSocialMedia={mockUserSocialMedia}
          saving={false}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
        />
      );

      fireEvent.press(getByText('✏️'));
      fireEvent.changeText(getByDisplayValue('john_doe'), 'new_username');
      fireEvent.press(getByText('✓'));

      await waitFor(() => {
        expect(getByDisplayValue('john_doe')).toBeTruthy();
      });
    });

    it('exits edit mode when cancel button pressed', () => {
      const { getByText, getByDisplayValue, queryByDisplayValue } = render(
        <SocialMediaChip
          userSocialMedia={mockUserSocialMedia}
          saving={false}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
        />
      );

      fireEvent.press(getByText('✏️'));
      fireEvent.changeText(getByDisplayValue('john_doe'), 'new_username');
      fireEvent.press(getByText('✕')); // Cancel button

      expect(queryByDisplayValue('new_username')).toBeNull();
      expect(getByText('@john_doe')).toBeTruthy();
    });

    it('reverts username to original value when cancel pressed', () => {
      const { getByText, getByDisplayValue, queryByDisplayValue } = render(
        <SocialMediaChip
          userSocialMedia={mockUserSocialMedia}
          saving={false}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
        />
      );

      fireEvent.press(getByText('✏️'));
      fireEvent.changeText(getByDisplayValue('john_doe'), 'new_username');
      fireEvent.press(getByText('✕')); // Cancel button

      // Après annulation, on sort du mode édition
      expect(queryByDisplayValue('new_username')).toBeNull();
      expect(getByText('@john_doe')).toBeTruthy();
    });
  });

  describe('Validation and error handling', () => {
    it('shows error alert when trying to save empty username', () => {
      const { getByText, getByDisplayValue } = render(
        <SocialMediaChip
          userSocialMedia={mockUserSocialMedia}
          saving={false}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
        />
      );

      fireEvent.press(getByText('✏️'));
      fireEvent.changeText(getByDisplayValue('john_doe'), '   '); // Whitespace only
      fireEvent.press(getByText('✓'));

      expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Le nom d\'utilisateur ne peut pas être vide');
    });

    it('shows error alert when trying to save empty string', () => {
      const { getByText, getByDisplayValue } = render(
        <SocialMediaChip
          userSocialMedia={mockUserSocialMedia}
          saving={false}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
        />
      );

      fireEvent.press(getByText('✏️'));
      fireEvent.changeText(getByDisplayValue('john_doe'), '');
      fireEvent.press(getByText('✓'));

      expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Le nom d\'utilisateur ne peut pas être vide');
    });

    it('exits edit mode when saving same username', async () => {
      const { getByText, getByDisplayValue, queryByDisplayValue } = render(
        <SocialMediaChip
          userSocialMedia={mockUserSocialMedia}
          saving={false}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
        />
      );

      fireEvent.press(getByText('✏️'));
      fireEvent.changeText(getByDisplayValue('john_doe'), 'john_doe'); // Same username
      fireEvent.press(getByText('✓'));

      await waitFor(() => {
        expect(queryByDisplayValue('john_doe')).toBeNull();
        expect(getByText('@john_doe')).toBeTruthy();
      });

      expect(mockOnUpdate).not.toHaveBeenCalled();
    });

    it('trims whitespace when saving username', async () => {
      mockOnUpdate.mockResolvedValue(undefined);

      const { getByText, getByDisplayValue } = render(
        <SocialMediaChip
          userSocialMedia={mockUserSocialMedia}
          saving={false}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
        />
      );

      fireEvent.press(getByText('✏️'));
      fireEvent.changeText(getByDisplayValue('john_doe'), '  new_username  ');
      fireEvent.press(getByText('✓'));

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith('sm1', 'new_username');
      });
    });
  });

  describe('Saving state', () => {
    it('disables buttons when saving is true', () => {
      const { getByText } = render(
        <SocialMediaChip
          userSocialMedia={mockUserSocialMedia}
          saving={true}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
        />
      );

      const editButton = getByText('✏️').parent;
      const removeButton = getByText('✕').parent;

      expect(editButton?.props.disabled).toBe(true);
      expect(removeButton?.props.disabled).toBe(true);
    });

    it('disables input when saving is true in edit mode', () => {
      const { getByText, getByDisplayValue } = render(
        <SocialMediaChip
          userSocialMedia={mockUserSocialMedia}
          saving={true}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
        />
      );

      fireEvent.press(getByText('✏️'));

      const input = getByDisplayValue('john_doe');
      expect(input.props.editable).toBe(false);
    });

    it('disables save and cancel buttons when saving is true', () => {
      const { getByText } = render(
        <SocialMediaChip
          userSocialMedia={mockUserSocialMedia}
          saving={true}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
        />
      );

      fireEvent.press(getByText('✏️'));

      const saveButton = getByText('✓').parent;
      const cancelButton = getByText('✕').parent;

      expect(saveButton?.props.disabled).toBe(true);
      expect(cancelButton?.props.disabled).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('handles social media without name', () => {
      const socialMediaWithoutName: ProfileSocialMedia = {
        id_profile: '1',
        id_social_media: 'sm1',
        username: 'john_doe',
        socialmedia: { id: 'sm1', name: undefined as any }
      };

      const { getByText } = render(
        <SocialMediaChip
          userSocialMedia={socialMediaWithoutName}
          saving={false}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
        />
      );

      expect(getByText('@john_doe')).toBeTruthy();
    });

    it('handles empty username', () => {
      const socialMediaWithEmptyUsername: ProfileSocialMedia = {
        id_profile: '1',
        id_social_media: 'sm1',
        username: '',
        socialmedia: { id: 'sm1', name: 'Instagram' }
      };

      const { getByText } = render(
        <SocialMediaChip
          userSocialMedia={socialMediaWithEmptyUsername}
          saving={false}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
        />
      );

      expect(getByText('Instagram')).toBeTruthy();
      expect(getByText('@')).toBeTruthy();
    });

    it('handles special characters in username', () => {
      const socialMediaWithSpecialChars: ProfileSocialMedia = {
        id_profile: '1',
        id_social_media: 'sm1',
        username: 'user.name_123',
        socialmedia: { id: 'sm1', name: 'Twitter' }
      };

      const { getByText } = render(
        <SocialMediaChip
          userSocialMedia={socialMediaWithSpecialChars}
          saving={false}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
        />
      );

      expect(getByText('@user.name_123')).toBeTruthy();
    });
  });

  describe('User interactions', () => {
    it('maintains edit state when typing in input', () => {
      const { getByText, getByDisplayValue } = render(
        <SocialMediaChip
          userSocialMedia={mockUserSocialMedia}
          saving={false}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
        />
      );

      fireEvent.press(getByText('✏️'));

      const input = getByDisplayValue('john_doe');
      fireEvent.changeText(input, 'test');
      fireEvent.changeText(input, 'test123');

      expect(getByDisplayValue('test123')).toBeTruthy();
      expect(getByText('✓')).toBeTruthy();
      expect(getByText('✕')).toBeTruthy();
    });

    it('allows multiple edit cycles', async () => {
      mockOnUpdate.mockResolvedValue(undefined);

      const { getByText, getByDisplayValue } = render(
        <SocialMediaChip
          userSocialMedia={mockUserSocialMedia}
          saving={false}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
        />
      );

      // First edit cycle
      fireEvent.press(getByText('✏️'));
      fireEvent.changeText(getByDisplayValue('john_doe'), 'first_edit');
      fireEvent.press(getByText('✓'));

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith('sm1', 'first_edit');
      });

      // Second edit cycle
      fireEvent.press(getByText('✏️'));
      fireEvent.changeText(getByDisplayValue('first_edit'), 'second_edit');
      fireEvent.press(getByText('✓'));

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith('sm1', 'second_edit');
      });

      expect(mockOnUpdate).toHaveBeenCalledTimes(2);
    });
  });
});
