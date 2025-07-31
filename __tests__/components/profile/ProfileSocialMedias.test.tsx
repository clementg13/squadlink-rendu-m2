import React from 'react';
import { render, fireEvent, waitFor } from '@/__tests__/utils/testUtils';
import { Alert } from 'react-native';
import ProfileSocialMedias from '@/components/profile/socialMedias/ProfileSocialMedias';
import { UserProfile, SocialMedia } from '@/types/profile';

// Mock Alert
const mockAlert = jest.fn();
jest.spyOn(Alert, 'alert').mockImplementation(mockAlert);

const mockSocialMedias: SocialMedia[] = [
  { id: '1', name: 'Instagram' },
  { id: '2', name: 'Facebook' },
];

const mockProfile: UserProfile = {
  id_user: 'user1',
  socialMedias: [
    {
      id_profile: 'profile1',
      id_social_media: '1',
      username: 'john_doe',
      socialmedia: { id: '1', name: 'Instagram' }
    }
  ]
};

const mockOnAddSocialMedia = jest.fn();
const mockOnUpdateSocialMedia = jest.fn();
const mockOnRemoveSocialMedia = jest.fn();

describe('ProfileSocialMedias', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders section title correctly', () => {
    const { getByText } = render(
      <ProfileSocialMedias
        profile={null}
        socialMedias={mockSocialMedias}
        saving={false}
        onAddSocialMedia={mockOnAddSocialMedia}
        onUpdateSocialMedia={mockOnUpdateSocialMedia}
        onRemoveSocialMedia={mockOnRemoveSocialMedia}
      />
    );

    expect(getByText('Réseaux sociaux')).toBeTruthy();
  });

  it('shows add button', () => {
    const { getByText } = render(
      <ProfileSocialMedias
        profile={null}
        socialMedias={mockSocialMedias}
        saving={false}
        onAddSocialMedia={mockOnAddSocialMedia}
        onUpdateSocialMedia={mockOnUpdateSocialMedia}
        onRemoveSocialMedia={mockOnRemoveSocialMedia}
      />
    );

    expect(getByText('+ Ajouter')).toBeTruthy();
  });

  it('shows no social media message when none added', () => {
    const { getByText } = render(
      <ProfileSocialMedias
        profile={null}
        socialMedias={mockSocialMedias}
        saving={false}
        onAddSocialMedia={mockOnAddSocialMedia}
        onUpdateSocialMedia={mockOnUpdateSocialMedia}
        onRemoveSocialMedia={mockOnRemoveSocialMedia}
      />
    );

    expect(getByText(/Aucun réseau social ajouté/)).toBeTruthy();
  });

  it('opens picker modal when add button is pressed', () => {
    const { getByText } = render(
      <ProfileSocialMedias
        profile={null}
        socialMedias={mockSocialMedias}
        saving={false}
        onAddSocialMedia={mockOnAddSocialMedia}
        onUpdateSocialMedia={mockOnUpdateSocialMedia}
        onRemoveSocialMedia={mockOnRemoveSocialMedia}
      />
    );

    fireEvent.press(getByText('+ Ajouter'));
    
    expect(getByText('Ajouter un réseau social')).toBeTruthy();
  });

  it('displays user social medias when available', () => {
    const { getByText } = render(
      <ProfileSocialMedias
        profile={mockProfile}
        socialMedias={mockSocialMedias}
        saving={false}
        onAddSocialMedia={mockOnAddSocialMedia}
        onUpdateSocialMedia={mockOnUpdateSocialMedia}
        onRemoveSocialMedia={mockOnRemoveSocialMedia}
      />
    );

    expect(getByText('Instagram')).toBeTruthy();
    expect(getByText('@john_doe')).toBeTruthy();
  });
});