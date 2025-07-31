import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SportChip from '@/components/profile/sports/SportChip';
import { ProfileSport } from '@/types/profile';

const mockUserSport: ProfileSport = {
  id_profile: '1',
  id_sport: '1',
  id_sport_level: '1',
  sport: { id: '1', name: 'Football' },
  sportlevel: { id: '1', name: 'Débutant' }
};

const mockOnRemove = jest.fn();

describe('SportChip', () => {
  beforeEach(() => {
    mockOnRemove.mockClear();
  });

  it('renders sport name and level correctly', () => {
    const { getByText } = render(
      <SportChip
        userSport={mockUserSport}
        saving={false}
        onRemove={mockOnRemove}
      />
    );

    expect(getByText('Football')).toBeTruthy();
    expect(getByText('Débutant')).toBeTruthy();
  });

  it('renders remove button with correct testID', () => {
    const { getByTestId } = render(
      <SportChip
        userSport={mockUserSport}
        saving={false}
        onRemove={mockOnRemove}
      />
    );

    expect(getByTestId('remove-sport')).toBeTruthy();
  });

  it('calls onRemove with correct sportId when remove button is pressed', () => {
    const { getByTestId } = render(
      <SportChip
        userSport={mockUserSport}
        saving={false}
        onRemove={mockOnRemove}
      />
    );

    fireEvent.press(getByTestId('remove-sport'));

    expect(mockOnRemove).toHaveBeenCalledWith('1');
    expect(mockOnRemove).toHaveBeenCalledTimes(1);
  });

  it('disables remove button when saving is true', () => {
    const { getByTestId } = render(
      <SportChip
        userSport={mockUserSport}
        saving={true}
        onRemove={mockOnRemove}
      />
    );

    const removeButton = getByTestId('remove-sport');
    expect(removeButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('does not call onRemove when button is disabled and pressed', () => {
    const { getByTestId } = render(
      <SportChip
        userSport={mockUserSport}
        saving={true}
        onRemove={mockOnRemove}
      />
    );

    fireEvent.press(getByTestId('remove-sport'));

    expect(mockOnRemove).not.toHaveBeenCalled();
  });

  it('handles missing sport data gracefully', () => {
    const userSportWithoutSport: ProfileSport = {
      id_profile: '1',
      id_sport: '1',
      id_sport_level: '1',
      sport: undefined,
      sportlevel: { id: '1', name: 'Débutant' }
    };

    const { getByTestId } = render(
      <SportChip
        userSport={userSportWithoutSport}
        saving={false}
        onRemove={mockOnRemove}
      />
    );

    expect(getByTestId('remove-sport')).toBeTruthy();
  });

  it('handles missing sport level data gracefully', () => {
    const userSportWithoutLevel: ProfileSport = {
      id_profile: '1',
      id_sport: '1',
      id_sport_level: '1',
      sport: { id: '1', name: 'Football' },
      sportlevel: undefined
    };

    const { getByText, getByTestId } = render(
      <SportChip
        userSport={userSportWithoutLevel}
        saving={false}
        onRemove={mockOnRemove}
      />
    );

    expect(getByText('Football')).toBeTruthy();
    expect(getByTestId('remove-sport')).toBeTruthy();
  });
});
