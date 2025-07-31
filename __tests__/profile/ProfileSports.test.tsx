import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProfileSports from '@/components/profile/sports/ProfileSports';
import { createMockProfile, createMockSport, createMockSportLevel, createMockProfileSport } from '@/__tests__/utils/testUtils';

const mockSports = [
  createMockSport({ id: '1', name: 'Football' }),
  createMockSport({ id: '2', name: 'Basketball' }),
];

const mockSportLevels = [
  createMockSportLevel({ id: '1', name: 'Débutant' }),
  createMockSportLevel({ id: '2', name: 'Intermédiaire' }),
];

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
    const mockProfile = createMockProfile({
      sports: [
        createMockProfileSport({
          id_sport: '1',
          id_sport_level: '1',
          sport: { id: '1', name: 'Football' },
          sportlevel: { id: '1', name: 'Débutant' }
        })
      ]
    });

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

  it('shows no sports message when empty', () => {
    const mockProfile = createMockProfile({ sports: [] });

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

    expect(getByText('Aucun sport ajouté. Ajoutez vos sports pratiqués pour améliorer votre profil !')).toBeTruthy();
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

  it('filters available sports correctly', () => {
    const mockProfile = createMockProfile({
      sports: [
        createMockProfileSport({ id_sport: '1' })
      ]
    });

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

    fireEvent.press(getByText('+ Ajouter'));
    
    // Should show only Basketball since Football is already added
    expect(getByText('Basketball')).toBeTruthy();
  });
});
