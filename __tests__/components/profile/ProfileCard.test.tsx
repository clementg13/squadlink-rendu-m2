import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProfileCard from '@/components/profile/ProfileCard';
import { CompatibleProfile } from '@/services/compatibleProfileService';

describe('ProfileCard', () => {
  const mockProfile: CompatibleProfile = {
    profile_id: '1',
    user_id: '1',
    firstname: 'John',
    lastname: 'Doe',
    age: 25,
    biography: 'Test biography',
    compatibility_score: 85,
    location: {
      id: '1',
      town: 'Paris',
      postal_code: '75001',
      location: 'Paris, France',
    },
    sports: [],
    hobbies: [],
    gym: null,
    gymSubscription: null,
  };

  it('renders profile name correctly', () => {
    const { getByText } = render(
      <ProfileCard profile={mockProfile} />
    );

    expect(getByText('John Doe')).toBeTruthy();
  });

  it('renders age when available', () => {
    const { getByText } = render(
      <ProfileCard profile={mockProfile} />
    );

    expect(getByText('25 ans')).toBeTruthy();
  });

  it('renders location when available', () => {
    const { getByText } = render(
      <ProfileCard profile={mockProfile} />
    );

    expect(getByText('📍 Paris')).toBeTruthy();
  });

  it('renders compatibility score correctly', () => {
    const { getByText } = render(
      <ProfileCard profile={mockProfile} />
    );

    expect(getByText('85%')).toBeTruthy();
  });

  it('renders biography when available', () => {
    const { getByText } = render(
      <ProfileCard profile={mockProfile} />
    );

    expect(getByText('Test biography')).toBeTruthy();
  });

  it('handles profile without age', () => {
    const profileWithoutAge = {
      ...mockProfile,
      age: null,
    };

    const { queryByText } = render(
      <ProfileCard profile={profileWithoutAge} />
    );

    expect(queryByText('25 ans')).toBeNull();
  });

  it('handles profile without location', () => {
    const profileWithoutLocation = {
      ...mockProfile,
      location: null,
    };

    const { queryByText } = render(
      <ProfileCard profile={profileWithoutLocation} />
    );

    expect(queryByText('📍 Paris')).toBeNull();
  });

  it('handles profile without biography', () => {
    const profileWithoutBiography = {
      ...mockProfile,
      biography: null,
    };

    const { queryByText } = render(
      <ProfileCard profile={profileWithoutBiography} />
    );

    expect(queryByText('Test biography')).toBeNull();
  });

  it('renders gym information when available', () => {
    const profileWithGym = {
      ...mockProfile,
      gym: {
        id: '1',
        name: 'Fitness Club',
      },
      gymSubscription: {
        id: '1',
        name: 'Premium',
        id_gym: '1',
      },
    };

    const { getByText } = render(
      <ProfileCard profile={profileWithGym} />
    );

    expect(getByText('🏋️ Fitness Club')).toBeTruthy();
    expect(getByText('• Premium')).toBeTruthy();
  });

  it('renders sports when available', () => {
    const profileWithSports = {
      ...mockProfile,
      sports: [
        {
          id_profile: '1',
          id_sport: '1',
          id_sport_level: '1',
          sport: { id: '1', name: 'Football' },
          sportlevel: { id: '1', name: 'Débutant' },
        },
        {
          id_profile: '1',
          id_sport: '2',
          id_sport_level: '2',
          sport: { id: '2', name: 'Basketball' },
          sportlevel: { id: '2', name: 'Intermédiaire' },
        },
      ],
    };

    const { getByText } = render(
      <ProfileCard profile={profileWithSports} />
    );

    expect(getByText('Football')).toBeTruthy();
    expect(getByText('Basketball')).toBeTruthy();
  });

  it('renders hobbies when available', () => {
    const profileWithHobbies = {
      ...mockProfile,
      hobbies: [
        {
          id: '1',
          id_profile: '1',
          id_hobbie: '1',
          is_highlighted: false,
          hobbie: { id: '1', name: 'Lecture' },
        },
        {
          id: '2',
          id_profile: '1',
          id_hobbie: '2',
          is_highlighted: true,
          hobbie: { id: '2', name: 'Musique' },
        },
      ],
    };

    const { getByText } = render(
      <ProfileCard profile={profileWithHobbies} />
    );

    expect(getByText('Lecture')).toBeTruthy();
    expect(getByText('Musique')).toBeTruthy();
  });

  it('shows remaining count for sports when more than 3', () => {
    const profileWithManySports = {
      ...mockProfile,
      sports: Array.from({ length: 5 }, (_, i) => ({
        id_profile: '1',
        id_sport: `${i + 1}`,
        id_sport_level: '1',
        sport: { id: `${i + 1}`, name: `Sport ${i + 1}` },
        sportlevel: { id: '1', name: 'Débutant' },
      })),
    };

    const { getByText } = render(
      <ProfileCard profile={profileWithManySports} />
    );

    expect(getByText('+2')).toBeTruthy();
  });

  it('shows remaining count for hobbies when more than 4', () => {
    const profileWithManyHobbies = {
      ...mockProfile,
      hobbies: Array.from({ length: 6 }, (_, i) => ({
        id: `${i + 1}`,
        id_profile: '1',
        id_hobbie: `${i + 1}`,
        is_highlighted: false,
        hobbie: { id: `${i + 1}`, name: `Hobby ${i + 1}` },
      })),
    };

    const { getByText } = render(
      <ProfileCard profile={profileWithManyHobbies} />
    );

    expect(getByText('+2')).toBeTruthy();
  });

  it('handles profile press correctly', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <ProfileCard profile={mockProfile} onPress={mockOnPress} />
    );

    fireEvent.press(getByText('John Doe'));

    expect(mockOnPress).toHaveBeenCalledWith(mockProfile);
  });

  it('renders compatibility icon correctly for high score', () => {
    const highScoreProfile = {
      ...mockProfile,
      compatibility_score: 90,
    };

    const { getByText } = render(
      <ProfileCard profile={highScoreProfile} />
    );

    expect(getByText('🔥')).toBeTruthy();
  });

  it('renders compatibility icon correctly for medium score', () => {
    const mediumScoreProfile = {
      ...mockProfile,
      compatibility_score: 70,
    };

    const { getByText } = render(
      <ProfileCard profile={mediumScoreProfile} />
    );

    expect(getByText('⭐')).toBeTruthy();
  });

  it('renders compatibility icon correctly for low score', () => {
    const lowScoreProfile = {
      ...mockProfile,
      compatibility_score: 30,
    };

    const { getByText } = render(
      <ProfileCard profile={lowScoreProfile} />
    );

    expect(getByText('👌')).toBeTruthy();
  });

  it('handles profile without sports gracefully', () => {
    const profileWithoutSports = {
      ...mockProfile,
      sports: null,
    };

    const { getByText } = render(
      <ProfileCard profile={profileWithoutSports} />
    );

    expect(getByText('John Doe')).toBeTruthy();
  });

  it('handles profile without hobbies gracefully', () => {
    const profileWithoutHobbies = {
      ...mockProfile,
      hobbies: null,
    };

    const { getByText } = render(
      <ProfileCard profile={profileWithoutHobbies} />
    );

    expect(getByText('John Doe')).toBeTruthy();
  });

  it('handles profile with empty sports array', () => {
    const profileWithEmptySports = {
      ...mockProfile,
      sports: [],
    };

    const { getByText } = render(
      <ProfileCard profile={profileWithEmptySports} />
    );

    expect(getByText('John Doe')).toBeTruthy();
  });

  it('handles profile with empty hobbies array', () => {
    const profileWithEmptyHobbies = {
      ...mockProfile,
      hobbies: [],
    };

    const { getByText } = render(
      <ProfileCard profile={profileWithEmptyHobbies} />
    );

    expect(getByText('John Doe')).toBeTruthy();
  });
}); 