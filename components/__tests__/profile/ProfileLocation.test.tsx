import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProfileLocation from '../../profile/location/ProfileLocation';
import { UserProfile } from '@/types/profile';

// Mock locationService
jest.mock('../../../services/locationService', () => ({
  locationService: {
    showLocationExplanation: jest.fn(),
    getCurrentLocation: jest.fn(),
  }
}));

const mockProfile: UserProfile = {
  id_user: 'user1',
  location: {
    id: '1',
    town: 'Paris',
    postal_code: '75001',
    location: 'POINT(2.3522 48.8566)'
  }
};

const mockOnUpdateLocation = jest.fn();

describe('ProfileLocation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders section title correctly', () => {
    const { getByText } = render(
      <ProfileLocation
        profile={null}
        saving={false}
        onUpdateLocation={mockOnUpdateLocation}
      />
    );

    expect(getByText('Localisation')).toBeTruthy();
  });

  it('shows current location when available', () => {
    const { getByText } = render(
      <ProfileLocation
        profile={mockProfile}
        saving={false}
        onUpdateLocation={mockOnUpdateLocation}
      />
    );

    expect(getByText('Paris (75001)')).toBeTruthy();
  });

  it('shows "Non définie" when no location', () => {
    const { getByText } = render(
      <ProfileLocation
        profile={null}
        saving={false}
        onUpdateLocation={mockOnUpdateLocation}
      />
    );

    expect(getByText('Non définie')).toBeTruthy();
  });

  it('shows update button', () => {
    const { getByText } = render(
      <ProfileLocation
        profile={null}
        saving={false}
        onUpdateLocation={mockOnUpdateLocation}
      />
    );

    expect(getByText('📍 Mettre à jour ma position')).toBeTruthy();
  });

  it('disables button when saving', () => {
    const { getByRole } = render(
      <ProfileLocation
        profile={null}
        saving={true}
        onUpdateLocation={mockOnUpdateLocation}
      />
    );

    const button = getByRole('button');
    expect(button.props.accessibilityState?.disabled).toBe(true);
  });
});
