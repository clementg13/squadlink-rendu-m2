import React from 'react';
import { render } from '@testing-library/react-native';
import ProfileInfo from '@/components/profile/ProfileInfo';
import { createMockProfile, createMockProfileSport, createMockProfileSocialMedia } from '@/__tests__/utils/testUtils';

describe('ProfileInfo', () => {
  it('renders basic profile information', () => {
    const mockProfile = createMockProfile({
      score: 150,
      fully_completed: true,
    });

    const { getByText } = render(
      <ProfileInfo profile={mockProfile} />
    );

    expect(getByText('Informations du compte')).toBeTruthy();
    expect(getByText('150 points')).toBeTruthy();
    expect(getByText('Oui')).toBeTruthy();
  });

  it('displays biography when available', () => {
    const mockProfile = createMockProfile({
      biography: 'Passionné de sport et de technologie',
    });

    const { getByText } = render(
      <ProfileInfo profile={mockProfile} />
    );

    expect(getByText('Biographie')).toBeTruthy();
    expect(getByText('Passionné de sport et de technologie')).toBeTruthy();
  });

  it('hides biography when not available', () => {
    const mockProfile = createMockProfile({
      biography: null,
    });

    const { queryByText } = render(
      <ProfileInfo profile={mockProfile} />
    );

    expect(queryByText('Biographie')).toBeNull();
  });

  it('displays sports count when available', () => {
    const mockProfile = createMockProfile({
      sports: [
        createMockProfileSport(),
        createMockProfileSport({ id_sport: 'sport2' }),
      ],
    });

    const { getByText } = render(
      <ProfileInfo profile={mockProfile} />
    );

    expect(getByText('Sports pratiqués')).toBeTruthy();
    expect(getByText('2 sport(s)')).toBeTruthy();
  });

  it('displays social media count when available', () => {
    const mockProfile = createMockProfile({
      socialMedias: [
        createMockProfileSocialMedia(),
        createMockProfileSocialMedia({ id_social_media: 'sm2' }),
      ],
    });

    const { getByText } = render(
      <ProfileInfo profile={mockProfile} />
    );

    expect(getByText('Réseaux sociaux')).toBeTruthy();
    expect(getByText('2 réseau(x)')).toBeTruthy();
  });

  it('handles null profile gracefully', () => {
    const { getByText } = render(
      <ProfileInfo profile={null} />
    );

    expect(getByText('Informations du compte')).toBeTruthy();
    expect(getByText('0 points')).toBeTruthy();
    expect(getByText('Non')).toBeTruthy();
  });

  it('shows incomplete profile status', () => {
    const mockProfile = createMockProfile({
      fully_completed: false,
    });

    const { getByText } = render(
      <ProfileInfo profile={mockProfile} />
    );

    expect(getByText('Non')).toBeTruthy();
  });
});
