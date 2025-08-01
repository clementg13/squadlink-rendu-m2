import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HobbyPickerModal from '@/components/profile/hobbies/HobbyPickerModal';
// Define Hobby type locally since it's not exported from '@/types/profile'
type Hobby = {
  id: string;
  name: string;
};

const mockHobbies: Hobby[] = [
  { id: '1', name: 'Lecture' },
  { id: '2', name: 'Musique' },
  { id: '3', name: 'Cuisine' }
];

const mockOnSelect = jest.fn();
const mockOnClose = jest.fn();

describe('HobbyPickerModal', () => {
  beforeEach(() => {
    mockOnSelect.mockClear();
    mockOnClose.mockClear();
  });

  it('shows hobbies list', () => {
    const { getByText } = render(
      <HobbyPickerModal
        visible={true}
        hobbies={mockHobbies}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    );

    expect(getByText('Sélectionnez un hobby')).toBeTruthy();
    expect(getByText('Lecture')).toBeTruthy();
    expect(getByText('Musique')).toBeTruthy();
    expect(getByText('Cuisine')).toBeTruthy();
  });

  it('calls onSelect when hobby is selected', () => {
    const { getByText } = render(
      <HobbyPickerModal
        visible={true}
        hobbies={mockHobbies}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    );

    fireEvent.press(getByText('Lecture'));
    expect(mockOnSelect).toHaveBeenCalledWith('1');
  });

  it('calls onClose when close button is pressed', () => {
    const { getByText } = render(
      <HobbyPickerModal
        visible={true}
        hobbies={mockHobbies}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    );

    fireEvent.press(getByText('Annuler'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
