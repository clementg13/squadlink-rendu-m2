import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { UserProfile } from '@/types/profile';
import ProfileHobbies from '@/components/profile/ProfileHobbies';

type Hobby = {
  id: string;
  name: string;
};

const mockHobbies: Hobby[] = [
  { id: '1', name: 'Lecture' },
  { id: '2', name: 'Musique' },
];

const mockProfile: UserProfile = {
  id_user: 'user1',
  hobbies: [
    {
      id: 'ph1',
      id_profile: 'profile1',
      id_hobbie: '1',
      is_highlighted: true,
      hobbie: { id: '1', name: 'Lecture' }
    }
  ]
};

const mockOnAddHobby = jest.fn();
const mockOnRemoveHobby = jest.fn();
const mockOnToggleHighlight = jest.fn();

describe('ProfileHobbies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays user hobbies when available', () => {
    const { getByText } = render(
      <ProfileHobbies
        profile={mockProfile}
        hobbies={mockHobbies}
        saving={false}
        onAddHobby={mockOnAddHobby}
        onRemoveHobby={mockOnRemoveHobby}
        onToggleHighlight={mockOnToggleHighlight}
      />
    );

    expect(getByText('Lecture')).toBeTruthy();
  });

  it('opens picker modal when add button is pressed', () => {
    const { getByText } = render(
      <ProfileHobbies
        profile={null}
        hobbies={mockHobbies}
        saving={false}
        onAddHobby={mockOnAddHobby}
        onRemoveHobby={mockOnRemoveHobby}
        onToggleHighlight={mockOnToggleHighlight}
      />
    );

    fireEvent.press(getByText('+ Ajouter'));
    
    expect(getByText('Sélectionnez un hobby')).toBeTruthy();
  });

  it('renders section title correctly', () => {
    const { getByText } = render(
      <ProfileHobbies
        profile={null}
        hobbies={mockHobbies}
        saving={false}
        onAddHobby={mockOnAddHobby}
        onRemoveHobby={mockOnRemoveHobby}
        onToggleHighlight={mockOnToggleHighlight}
      />
    );

    expect(getByText('Mes hobbies')).toBeTruthy();
  });

  it('shows add button', () => {
    const { getByText } = render(
      <ProfileHobbies
        profile={null}
        hobbies={mockHobbies}
        saving={false}
        onAddHobby={mockOnAddHobby}
        onRemoveHobby={mockOnRemoveHobby}
        onToggleHighlight={mockOnToggleHighlight}
      />
    );

    expect(getByText('+ Ajouter')).toBeTruthy();
  });
});
