import React from 'react';
import { render } from '@/__tests__/utils/testUtils';
import ProfileHeader from '@/components/profile/ProfileHeader';

describe('ProfileHeader', () => {
  it('renders title correctly', () => {
    const { getByText } = render(<ProfileHeader />);
    expect(getByText('Mon Profil')).toBeTruthy();
  });

  it('displays first letter of firstname when provided', () => {
    const { getByText } = render(
      <ProfileHeader firstname="John" lastname="Doe" />
    );
    expect(getByText('J')).toBeTruthy();
  });

  it('displays first letter of lastname when firstname not provided', () => {
    const { getByText } = render(
      <ProfileHeader lastname="Doe" />
    );
    expect(getByText('D')).toBeTruthy();
  });

  it('displays question mark when no names provided', () => {
    const { getByText } = render(<ProfileHeader />);
    expect(getByText('?')).toBeTruthy();
  });

  it('prefers firstname over lastname for initials', () => {
    const { getByText } = render(
      <ProfileHeader firstname="John" lastname="Doe" />
    );
    expect(getByText('J')).toBeTruthy();
  });
});
