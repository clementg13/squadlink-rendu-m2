import React from 'react';
import { render } from '@testing-library/react-native';
import SportTag from '@/components/profile/tags/SportTag';
import { ProfileSport } from '@/types/profile';

describe('SportTag', () => {
  const mockSport: ProfileSport = {
    id_profile: '1',
    id_sport: '1',
    id_sport_level: '1',
    sport: {
      id: '1',
      name: 'Football',
    },
    sportlevel: {
      id: '1',
      name: 'Débutant',
    },
  };

  const mockAdvancedSport: ProfileSport = {
    id_profile: '1',
    id_sport: '2',
    id_sport_level: '2',
    sport: {
      id: '2',
      name: 'Basketball',
    },
    sportlevel: {
      id: '2',
      name: 'Avancé',
    },
  };

  it('renders sport name correctly', () => {
    const { getByText } = render(
      <SportTag sport={mockSport} />
    );

    expect(getByText('Football')).toBeTruthy();
  });

  it('renders sport level correctly', () => {
    const { getByText } = render(
      <SportTag sport={mockSport} />
    );

    expect(getByText('Débutant')).toBeTruthy();
  });

  it('renders with small size', () => {
    const { getByText } = render(
      <SportTag sport={mockSport} size="small" />
    );

    expect(getByText('Football')).toBeTruthy();
    expect(getByText('Débutant')).toBeTruthy();
  });

  it('renders with medium size by default', () => {
    const { getByText } = render(
      <SportTag sport={mockSport} />
    );

    expect(getByText('Football')).toBeTruthy();
    expect(getByText('Débutant')).toBeTruthy();
  });

  it('handles missing sport data gracefully', () => {
    const sportWithoutData: ProfileSport = {
      id_profile: '1',
      id_sport: '1',
      id_sport_level: '1',
      sport: undefined,
      sportlevel: undefined,
    };

    const { getByText } = render(
      <SportTag sport={sportWithoutData} />
    );

    expect(getByText('Sport')).toBeTruthy();
  });

  it('handles missing sport name gracefully', () => {
    const sportWithoutName: ProfileSport = {
      id_profile: '1',
      id_sport: '1',
      id_sport_level: '1',
      sport: {
        id: '1',
        name: undefined,
      },
      sportlevel: {
        id: '1',
        name: 'Débutant',
      },
    };

    const { getByText } = render(
      <SportTag sport={sportWithoutName} />
    );

    expect(getByText('Sport')).toBeTruthy();
    expect(getByText('Débutant')).toBeTruthy();
  });

  it('handles missing sport level gracefully', () => {
    const sportWithoutLevel: ProfileSport = {
      id_profile: '1',
      id_sport: '1',
      id_sport_level: '1',
      sport: {
        id: '1',
        name: 'Football',
      },
      sportlevel: undefined,
    };

    const { getByText, queryByText } = render(
      <SportTag sport={sportWithoutLevel} />
    );

    expect(getByText('Football')).toBeTruthy();
    expect(queryByText('Débutant')).toBeNull();
  });

  it('handles missing sport level name gracefully', () => {
    const sportWithoutLevelName: ProfileSport = {
      id_profile: '1',
      id_sport: '1',
      id_sport_level: '1',
      sport: {
        id: '1',
        name: 'Football',
      },
      sportlevel: {
        id: '1',
        name: undefined,
      },
    };

    const { getByText, queryByText } = render(
      <SportTag sport={sportWithoutLevelName} />
    );

    expect(getByText('Football')).toBeTruthy();
    expect(queryByText('Débutant')).toBeNull();
  });

  it('applies correct styling for beginner level', () => {
    const { getByText } = render(
      <SportTag sport={mockSport} />
    );

    const tagElement = getByText('Football').parent;
    expect(tagElement).toBeTruthy();
  });

  it('applies correct styling for advanced level', () => {
    const { getByText } = render(
      <SportTag sport={mockAdvancedSport} />
    );

    const tagElement = getByText('Basketball').parent;
    expect(tagElement).toBeTruthy();
  });

  it('renders with different sizes correctly', () => {
    const { getByText: getByTextSmall } = render(
      <SportTag sport={mockSport} size="small" />
    );

    const { getByText: getByTextMedium } = render(
      <SportTag sport={mockSport} size="medium" />
    );

    expect(getByTextSmall('Football')).toBeTruthy();
    expect(getByTextSmall('Débutant')).toBeTruthy();
    expect(getByTextMedium('Football')).toBeTruthy();
    expect(getByTextMedium('Débutant')).toBeTruthy();
  });

  it('handles different level names correctly', () => {
    const intermediateSport: ProfileSport = {
      id_profile: '1',
      id_sport: '3',
      id_sport_level: '3',
      sport: {
        id: '3',
        name: 'Tennis',
      },
      sportlevel: {
        id: '3',
        name: 'Intermédiaire',
      },
    };

    const { getByText } = render(
      <SportTag sport={intermediateSport} />
    );

    expect(getByText('Tennis')).toBeTruthy();
    expect(getByText('Intermédiaire')).toBeTruthy();
  });

  it('handles expert level correctly', () => {
    const expertSport: ProfileSport = {
      id_profile: '1',
      id_sport: '4',
      id_sport_level: '4',
      sport: {
        id: '4',
        name: 'Natation',
      },
      sportlevel: {
        id: '4',
        name: 'Expert',
      },
    };

    const { getByText } = render(
      <SportTag sport={expertSport} />
    );

    expect(getByText('Natation')).toBeTruthy();
    expect(getByText('Expert')).toBeTruthy();
  });

  it('handles unknown level with default styling', () => {
    const unknownLevelSport: ProfileSport = {
      id_profile: '1',
      id_sport: '5',
      id_sport_level: '5',
      sport: {
        id: '5',
        name: 'Escalade',
      },
      sportlevel: {
        id: '5',
        name: 'Autre niveau',
      },
    };

    const { getByText } = render(
      <SportTag sport={unknownLevelSport} />
    );

    expect(getByText('Escalade')).toBeTruthy();
    expect(getByText('Autre niveau')).toBeTruthy();
  });
}); 