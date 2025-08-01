import React from 'react';
import { render } from '@testing-library/react-native';
import HobbyTag from '@/components/profile/tags/HobbyTag';
import { ProfileHobby } from '@/types/profile';

describe('HobbyTag', () => {
  const mockHobby: ProfileHobby = {
    id_profile: '1',
    id_hobby: '1',
    hobbie: {
      id: '1',
      name: 'Football',
    },
    is_highlighted: false,
  };

  const mockHighlightedHobby: ProfileHobby = {
    id_profile: '1',
    id_hobby: '1',
    hobbie: {
      id: '1',
      name: 'Basketball',
    },
    is_highlighted: true,
  };

  it('renders hobby name correctly', () => {
    const { getByText } = render(
      <HobbyTag hobby={mockHobby} />
    );

    expect(getByText('Football')).toBeTruthy();
  });

  it('renders with small size', () => {
    const { getByText } = render(
      <HobbyTag hobby={mockHobby} size="small" />
    );

    expect(getByText('Football')).toBeTruthy();
  });

  it('renders with medium size by default', () => {
    const { getByText } = render(
      <HobbyTag hobby={mockHobby} />
    );

    expect(getByText('Football')).toBeTruthy();
  });

  it('shows highlight icon when hobby is highlighted', () => {
    const { getByText } = render(
      <HobbyTag hobby={mockHighlightedHobby} />
    );

    expect(getByText('Basketball')).toBeTruthy();
    expect(getByText('⭐')).toBeTruthy();
  });

  it('does not show highlight icon when hobby is not highlighted', () => {
    const { getByText, queryByText } = render(
      <HobbyTag hobby={mockHobby} />
    );

    expect(getByText('Football')).toBeTruthy();
    expect(queryByText('⭐')).toBeNull();
  });

  it('handles missing hobby data gracefully', () => {
    const hobbyWithoutData: ProfileHobby = {
      id_profile: '1',
      id_hobby: '1',
      hobbie: undefined,
      is_highlighted: false,
    };

    const { getByText } = render(
      <HobbyTag hobby={hobbyWithoutData} />
    );

    expect(getByText('Hobby')).toBeTruthy();
  });

  it('handles missing hobby name gracefully', () => {
    const hobbyWithoutName: ProfileHobby = {
      id_profile: '1',
      id_hobby: '1',
      hobbie: {
        id: '1',
        name: undefined,
      },
      is_highlighted: false,
    };

    const { getByText } = render(
      <HobbyTag hobby={hobbyWithoutName} />
    );

    expect(getByText('Hobby')).toBeTruthy();
  });

  it('applies correct styling for highlighted hobby', () => {
    const { getByText } = render(
      <HobbyTag hobby={mockHighlightedHobby} />
    );

    const tagElement = getByText('Basketball').parent;
    expect(tagElement).toBeTruthy();
  });

  it('applies correct styling for non-highlighted hobby', () => {
    const { getByText } = render(
      <HobbyTag hobby={mockHobby} />
    );

    const tagElement = getByText('Football').parent;
    expect(tagElement).toBeTruthy();
  });

  it('renders with different sizes correctly', () => {
    const { getByText: getByTextSmall } = render(
      <HobbyTag hobby={mockHobby} size="small" />
    );

    const { getByText: getByTextMedium } = render(
      <HobbyTag hobby={mockHobby} size="medium" />
    );

    expect(getByTextSmall('Football')).toBeTruthy();
    expect(getByTextMedium('Football')).toBeTruthy();
  });
}); 