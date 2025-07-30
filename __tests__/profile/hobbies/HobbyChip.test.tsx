import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HobbyChip from '../../../profile/hobbies/HobbyChip';
import { ProfileHobby } from '@/types/profile';

const mockUserHobby: ProfileHobby = {
  id: '1',
  id_profile: '1',
  id_hobbie: 'hobby1',
  is_highlighted: false,
  hobbie: { id: 'hobby1', name: 'Lecture' }
};

const mockOnToggleHighlight = jest.fn();
const mockOnRemove = jest.fn();

describe('HobbyChip', () => {
  beforeEach(() => {
    mockOnToggleHighlight.mockClear();
    mockOnRemove.mockClear();
  });

  it('displays hobby name', () => {
    const { getByText } = render(
      <HobbyChip
        userHobby={mockUserHobby}
        isHighlighted={false}
        canHighlight={true}
        saving={false}
        onToggleHighlight={mockOnToggleHighlight}
        onRemove={mockOnRemove}
      />
    );

    expect(getByText('Lecture')).toBeTruthy();
  });

  it('shows star button when can highlight and not highlighted', () => {
    const { getByText } = render(
      <HobbyChip
        userHobby={mockUserHobby}
        isHighlighted={false}
        canHighlight={true}
        saving={false}
        onToggleHighlight={mockOnToggleHighlight}
        onRemove={mockOnRemove}
      />
    );

    expect(getByText('☆')).toBeTruthy();
  });

  it('shows filled star when highlighted', () => {
    const { getByText } = render(
      <HobbyChip
        userHobby={{ ...mockUserHobby, is_highlighted: true }}
        isHighlighted={true}
        canHighlight={false}
        saving={false}
        onToggleHighlight={mockOnToggleHighlight}
        onRemove={mockOnRemove}
      />
    );

    expect(getByText('⭐')).toBeTruthy();
  });

  it('calls onToggleHighlight when star pressed', () => {
    const { getByText } = render(
      <HobbyChip
        userHobby={mockUserHobby}
        isHighlighted={false}
        canHighlight={true}
        saving={false}
        onToggleHighlight={mockOnToggleHighlight}
        onRemove={mockOnRemove}
      />
    );

    fireEvent.press(getByText('☆'));
    expect(mockOnToggleHighlight).toHaveBeenCalledWith('hobby1');
  });

  it('calls onRemove when remove button pressed', () => {
    const { getByText } = render(
      <HobbyChip
        userHobby={mockUserHobby}
        isHighlighted={false}
        canHighlight={true}
        saving={false}
        onToggleHighlight={mockOnToggleHighlight}
        onRemove={mockOnRemove}
      />
    );

    fireEvent.press(getByText('✕'));
    expect(mockOnRemove).toHaveBeenCalledWith('hobby1');
  });
});
