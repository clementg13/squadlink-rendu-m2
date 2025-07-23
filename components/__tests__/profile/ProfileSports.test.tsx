import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProfileSports from '../../profile/sports/ProfileSports';
import { UserProfile, Sport, SportLevel } from '@/types/profile';

const mockSports: Sport[] = [
  { id: '1', name: 'Football' },
  { id: '2', name: 'Basketball' },
];

const mockSportLevels: SportLevel[] = [
  { id: '1', name: 'Débutant' },
  { id: '2', name: 'Intermédiaire' },
];

const mockProfile: UserProfile = {
  id_user: 'user1',
  sports: [
    {
      id_profile: 'profile1',
      id_sport: '1',
      id_sport_level: '1',
      sport: { id: '1', name: 'Football' },
      sportlevel: { id: '1', name: 'Débutant' }
    }
  ]
};

const mockOnAddSport = jest.fn();
const mockOnRemoveSport = jest.fn();

describe('ProfileSports', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders section title correctly', () => {
    const { getByText } = render(
      <ProfileSports
        profile={null}
        sports={mockSports}
        sportLevels={mockSportLevels}
        saving={false}
        onAddSport={mockOnAddSport}
        onRemoveSport={mockOnRemoveSport}
      />
    );

    expect(getByText('Mes sports')).toBeTruthy();
  });

  it('shows add button', () => {
    const { getByText } = render(
      <ProfileSports
        profile={null}
        sports={mockSports}
        sportLevels={mockSportLevels}
        saving={false}
        onAddSport={mockOnAddSport}
        onRemoveSport={mockOnRemoveSport}
      />
    );

    expect(getByText('+ Ajouter')).toBeTruthy();
  });

  it('displays user sports when available', () => {
    const { getByText } = render(
      <ProfileSports
        profile={mockProfile}
        sports={mockSports}
        sportLevels={mockSportLevels}
        saving={false}
        onAddSport={mockOnAddSport}
        onRemoveSport={mockOnRemoveSport}
      />
    );

    expect(getByText('Football')).toBeTruthy();
    expect(getByText('Débutant')).toBeTruthy();
  });

  it('opens picker modal when add button is pressed', () => {
    const { getByText } = render(
      <ProfileSports
        profile={null}
        sports={mockSports}
        sportLevels={mockSportLevels}
        saving={false}
        onAddSport={mockOnAddSport}
        onRemoveSport={mockOnRemoveSport}
      />
    );

    fireEvent.press(getByText('+ Ajouter'));
    
    expect(getByText('Ajouter un sport')).toBeTruthy();
  });
});
