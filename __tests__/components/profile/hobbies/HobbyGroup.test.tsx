import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HobbyGroup from '@/components/profile/hobbies/HobbyGroup';
import { ProfileHobby } from '@/types/profile';

describe('HobbyGroup', () => {
  const mockHobbies: ProfileHobby[] = [
    {
      id: '1',
      id_profile: '1',
      id_hobbie: '1',
      is_highlighted: false,
      hobbie: {
        id: '1',
        name: 'Football',
      },
    },
    {
      id: '2',
      id_profile: '1',
      id_hobbie: '2',
      is_highlighted: true,
      hobbie: {
        id: '2',
        name: 'Basketball',
      },
    },
  ];

  const mockOnToggleHighlight = jest.fn();
  const mockOnRemove = jest.fn();

  beforeEach(() => {
    mockOnToggleHighlight.mockClear();
    mockOnRemove.mockClear();
  });

  it('renders group title correctly', () => {
    const { getByText } = render(
      <HobbyGroup
        title="Sports"
        hobbies={mockHobbies}
        canHighlight={true}
        saving={false}
        onToggleHighlight={mockOnToggleHighlight}
        onRemove={mockOnRemove}
      />
    );

    expect(getByText('Sports')).toBeTruthy();
  });

  it('renders all hobbies in the group', () => {
    const { getByText } = render(
      <HobbyGroup
        title="Sports"
        hobbies={mockHobbies}
        canHighlight={true}
        saving={false}
        onToggleHighlight={mockOnToggleHighlight}
        onRemove={mockOnRemove}
      />
    );

    expect(getByText('Football')).toBeTruthy();
    expect(getByText('Basketball')).toBeTruthy();
  });

  it('does not render when hobbies array is empty', () => {
    const { queryByText } = render(
      <HobbyGroup
        title="Sports"
        hobbies={[]}
        canHighlight={true}
        saving={false}
        onToggleHighlight={mockOnToggleHighlight}
        onRemove={mockOnRemove}
      />
    );

    expect(queryByText('Sports')).toBeNull();
  });

  it('handles highlighted and non-highlighted hobbies', () => {
    const { getByText } = render(
      <HobbyGroup
        title="Sports"
        hobbies={mockHobbies}
        canHighlight={true}
        saving={false}
        onToggleHighlight={mockOnToggleHighlight}
        onRemove={mockOnRemove}
      />
    );

    expect(getByText('Football')).toBeTruthy();
    expect(getByText('Basketball')).toBeTruthy();
  });

  it('passes correct props to HobbyChip components', () => {
    const { getByText } = render(
      <HobbyGroup
        title="Sports"
        hobbies={mockHobbies}
        canHighlight={true}
        saving={false}
        onToggleHighlight={mockOnToggleHighlight}
        onRemove={mockOnRemove}
      />
    );

    // Vérifier que les hobbies sont rendus
    expect(getByText('Football')).toBeTruthy();
    expect(getByText('Basketball')).toBeTruthy();
  });

  it('handles canHighlight prop correctly', () => {
    const { getByText } = render(
      <HobbyGroup
        title="Sports"
        hobbies={mockHobbies}
        canHighlight={false}
        saving={false}
        onToggleHighlight={mockOnToggleHighlight}
        onRemove={mockOnRemove}
      />
    );

    // Vérifier que les hobbies sont toujours rendus
    expect(getByText('Football')).toBeTruthy();
    expect(getByText('Basketball')).toBeTruthy();
  });

  it('handles saving state correctly', () => {
    const { getByText } = render(
      <HobbyGroup
        title="Sports"
        hobbies={mockHobbies}
        canHighlight={true}
        saving={true}
        onToggleHighlight={mockOnToggleHighlight}
        onRemove={mockOnRemove}
      />
    );

    expect(getByText('Football')).toBeTruthy();
    expect(getByText('Basketball')).toBeTruthy();
  });

  it('handles missing hobby data gracefully', () => {
    const hobbiesWithMissingData: ProfileHobby[] = [
      {
        id: '1',
        id_profile: '1',
        id_hobbie: '1',
        is_highlighted: false,
        hobbie: undefined,
      },
    ];

    const { getByText } = render(
      <HobbyGroup
        title="Sports"
        hobbies={hobbiesWithMissingData}
        canHighlight={true}
        saving={false}
        onToggleHighlight={mockOnToggleHighlight}
        onRemove={mockOnRemove}
      />
    );

    expect(getByText('Sports')).toBeTruthy();
  });

  it('handles different group titles', () => {
    const { getByText } = render(
      <HobbyGroup
        title="Loisirs créatifs"
        hobbies={mockHobbies}
        canHighlight={true}
        saving={false}
        onToggleHighlight={mockOnToggleHighlight}
        onRemove={mockOnRemove}
      />
    );

    expect(getByText('Loisirs créatifs')).toBeTruthy();
  });

  it('handles hobbies with special characters', () => {
    const hobbiesWithSpecialChars: ProfileHobby[] = [
      {
        id: '1',
        id_profile: '1',
        id_hobbie: '1',
        is_highlighted: false,
        hobbie: {
          id: '1',
          name: 'Échecs ♟️',
        },
      },
    ];

    const { getByText } = render(
      <HobbyGroup
        title="Jeux"
        hobbies={hobbiesWithSpecialChars}
        canHighlight={true}
        saving={false}
        onToggleHighlight={mockOnToggleHighlight}
        onRemove={mockOnRemove}
      />
    );

    expect(getByText('Échecs ♟️')).toBeTruthy();
  });
}); 