import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SocialMediaChip from '../../../profile/socialMedias/SocialMediaChip';
import { ProfileSocialMedia } from '@/types/profile';

const mockUserSocialMedia: ProfileSocialMedia = {
  id_profile: '1',
  id_social_media: 'sm1',
  username: 'john_doe',
  socialmedia: { id: 'sm1', name: 'Instagram' }
};

const mockOnUpdate = jest.fn();
const mockOnRemove = jest.fn();

describe('SocialMediaChip', () => {
  beforeEach(() => {
    mockOnUpdate.mockClear();
    mockOnRemove.mockClear();
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
});
