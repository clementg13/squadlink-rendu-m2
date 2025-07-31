import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';

// Mock useAuth
const mockSetIsOnboarding = jest.fn();
jest.mock('@/stores/authStore', () => ({
  useAuth: () => ({
    setIsOnboarding: mockSetIsOnboarding,
  }),
}));

// Mock supabase
const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  })),
};

jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}));

// Mock locationService
const mockLocationService = {
  updateLocationInDatabase: jest.fn(),
};

jest.mock('@/services/locationService', () => ({
  locationService: mockLocationService,
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock child components with React Native compatible elements
jest.mock('@/components/onboarding/steps/OnboardingWelcome', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  
  return function MockOnboardingWelcome({ onNext }: { onNext: () => void }) {
    return (
      <View testID="welcome-step">
        <TouchableOpacity testID="welcome-next" onPress={onNext}>
          <Text>Next</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

jest.mock('@/components/onboarding/steps/OnboardingCredentials', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  
  return function MockOnboardingCredentials({ onNext }: { onNext: (userId: string) => void }) {
    return (
      <View testID="credentials-step">
        <TouchableOpacity testID="credentials-next" onPress={() => onNext('user123')}>
          <Text>Next</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

jest.mock('@/components/onboarding/steps/OnboardingProfile', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  
  return function MockOnboardingProfile({ 
    onNext, 
    onBack 
  }: { 
    onNext: (data: any) => void;
    onBack: () => void;
  }) {
    const mockProfileData = {
      firstname: 'John',
      lastname: 'Doe',
      birthdate: new Date('1990-01-01'),
    };
    
    return (
      <View testID="profile-step">
        <TouchableOpacity testID="profile-next" onPress={() => onNext(mockProfileData)}>
          <Text>Next</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="profile-back" onPress={onBack}>
          <Text>Back</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

jest.mock('@/components/onboarding/steps/OnboardingSports', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  
  return function MockOnboardingSports({ 
    onNext, 
    onBack 
  }: { 
    onNext: (sports: any[]) => void;
    onBack: () => void;
  }) {
    const mockSports = [{ sportId: '1', levelId: '1', sportName: 'Football', levelName: 'Débutant' }];
    
    return (
      <View testID="sports-step">
        <TouchableOpacity testID="sports-next" onPress={() => onNext(mockSports)}>
          <Text>Next</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="sports-back" onPress={onBack}>
          <Text>Back</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

jest.mock('@/components/onboarding/steps/OnboardingHobbies', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  
  return function MockOnboardingHobbies({ 
    onNext, 
    onBack 
  }: { 
    onNext: (hobbies: string[]) => void;
    onBack: () => void;
  }) {
    return (
      <View testID="hobbies-step">
        <TouchableOpacity testID="hobbies-next" onPress={() => onNext(['1', '2'])}>
          <Text>Next</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="hobbies-back" onPress={onBack}>
          <Text>Back</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

jest.mock('@/components/onboarding/steps/OnboardingCompletion', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  
  return function MockOnboardingCompletion() {
    return (
      <View testID="completion-step">
        <Text>Completion</Text>
      </View>
    );
  };
});

jest.mock('@/components/onboarding/OnboardingProgress', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  
  return function MockOnboardingProgress() {
    return (
      <View testID="progress-bar">
        <Text>Progress</Text>
      </View>
    );
  };
});

describe('OnboardingContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user123' } },
      error: null,
    });
    
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: 'profile123' }, error: null }),
    });
  });

  it('renders welcome step initially', () => {
    const { getByTestId } = render(<OnboardingContainer />);
    expect(getByTestId('welcome-step')).toBeTruthy();
  });

  it('sets onboarding mode on mount', () => {
    render(<OnboardingContainer />);
    expect(mockSetIsOnboarding).toHaveBeenCalledWith(true);
  });

  it('navigates through steps correctly', async () => {
    const { getByTestId, queryByTestId } = render(<OnboardingContainer />);
    
    // Start at welcome
    expect(getByTestId('welcome-step')).toBeTruthy();
    
    // Go to credentials
    fireEvent.press(getByTestId('welcome-next'));
    await waitFor(() => {
      expect(queryByTestId('welcome-step')).toBeNull();
      expect(getByTestId('credentials-step')).toBeTruthy();
    });
    
    // Go to profile
    fireEvent.press(getByTestId('credentials-next'));
    await waitFor(() => {
      expect(queryByTestId('credentials-step')).toBeNull();
      expect(getByTestId('profile-step')).toBeTruthy();
    });
  });

  it('handles back navigation correctly', async () => {
    const { getByTestId, queryByTestId } = render(<OnboardingContainer />);
    
    // Navigate to profile step
    fireEvent.press(getByTestId('welcome-next'));
    await waitFor(() => expect(getByTestId('credentials-step')).toBeTruthy());
    
    fireEvent.press(getByTestId('credentials-next'));
    await waitFor(() => expect(getByTestId('profile-step')).toBeTruthy());
    
    // Go back to credentials
    fireEvent.press(getByTestId('profile-back'));
    await waitFor(() => {
      expect(queryByTestId('profile-step')).toBeNull();
      expect(getByTestId('credentials-step')).toBeTruthy();
    });
  });

  it('shows progress bar on intermediate steps', async () => {
    const { getByTestId, queryByTestId } = render(<OnboardingContainer />);
    
    // Welcome step - no progress bar
    expect(queryByTestId('progress-bar')).toBeNull();
    
    // Navigate to credentials - should show progress bar
    fireEvent.press(getByTestId('welcome-next'));
    await waitFor(() => {
      expect(getByTestId('progress-bar')).toBeTruthy();
    });
  });

  it('handles save errors gracefully', async () => {
    const saveError = new Error('Save failed');
    
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: saveError,
    });
    
    const { getByTestId } = render(<OnboardingContainer />);
    
    // Navigate to hobbies and trigger save
    fireEvent.press(getByTestId('welcome-next'));
    await waitFor(() => fireEvent.press(getByTestId('credentials-next')));
    await waitFor(() => fireEvent.press(getByTestId('profile-next')));
    await waitFor(() => fireEvent.press(getByTestId('sports-next')));
    await waitFor(() => fireEvent.press(getByTestId('hobbies-next')));
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Erreur de sauvegarde',
        expect.stringContaining('Cannot read properties'),
        expect.any(Array)
      );
    });
  });
});
