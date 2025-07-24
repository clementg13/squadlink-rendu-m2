import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SportPickerModal from '../../../profile/sports/SportPickerModal';
import { Sport, SportLevel } from '@/types/profile';

const mockSports: Sport[] = [
  { id: '1', name: 'Football' },
  { id: '2', name: 'Basketball' }
];

const mockSportLevels: SportLevel[] = [
  { id: '1', name: 'Débutant' },
  { id: '2', name: 'Intermédiaire' }
];

const mockOnSelect = jest.fn();
const mockOnClose = jest.fn();

describe('SportPickerModal', () => {
  beforeEach(() => {
    mockOnSelect.mockClear();
    mockOnClose.mockClear();
  });

  it('shows sports list initially', () => {
    const { getByText } = render(
      <SportPickerModal
        visible={true}
        sports={mockSports}
        sportLevels={mockSportLevels}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    );

    expect(getByText('Ajouter un sport')).toBeTruthy();
    expect(getByText('1. Choisissez un sport :')).toBeTruthy();
    expect(getByText('Football')).toBeTruthy();
    expect(getByText('Basketball')).toBeTruthy();
  });

  it('shows levels after selecting sport', () => {
    const { getByText } = render(
      <SportPickerModal
        visible={true}
        sports={mockSports}
        sportLevels={mockSportLevels}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    );

    fireEvent.press(getByText('Football'));

    expect(getByText('2. Choisissez votre niveau en Football :')).toBeTruthy();
    expect(getByText('Débutant')).toBeTruthy();
    expect(getByText('Intermédiaire')).toBeTruthy();
  });

  it('enables confirm button after selecting level', () => {
    const { getByText, getByTestId } = render(
      <SportPickerModal
        visible={true}
        sports={mockSports}
        sportLevels={mockSportLevels}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    );

    fireEvent.press(getByText('Football'));
    fireEvent.press(getByText('Débutant'));

    const confirmButton = getByTestId('confirm-button');
    expect(confirmButton.props.disabled).toBeFalsy();
  });

  it('calls onSelect with correct parameters', () => {
    const { getByText } = render(
      <SportPickerModal
        visible={true}
        sports={mockSports}
        sportLevels={mockSportLevels}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    );

    fireEvent.press(getByText('Football'));
    fireEvent.press(getByText('Débutant'));
    fireEvent.press(getByText('Confirmer'));

    expect(mockOnSelect).toHaveBeenCalledWith('1', '1');
  });
});
