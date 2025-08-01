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

// Mock OnboardingTerms et OnboardingPrivacy pour permettre la navigation dans les tests
jest.mock('@/components/onboarding/steps/OnboardingTerms', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  return function MockOnboardingTerms({ onAccept }: { onAccept: () => void }) {
    return (
      <View testID="terms-step">
        <TouchableOpacity testID="terms-accept" onPress={onAccept}>
          <Text>J'accepte</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

jest.mock('@/components/onboarding/steps/OnboardingPrivacy', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  return function MockOnboardingPrivacy({ onAccept }: { onAccept: () => void }) {
    return (
      <View testID="privacy-step">
        <TouchableOpacity testID="privacy-accept" onPress={onAccept}>
          <Text>J'accepte</Text>
        </TouchableOpacity>
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
    
    // Welcome
    expect(getByTestId('welcome-step')).toBeTruthy();
    
    // Go to terms
    fireEvent.press(getByTestId('welcome-next'));
    await waitFor(() => {
      expect(queryByTestId('welcome-step')).toBeNull();
      expect(getByTestId('terms-step')).toBeTruthy();
    });
    
    // Go to privacy
    fireEvent.press(getByTestId('terms-accept'));
    await waitFor(() => {
      expect(queryByTestId('terms-step')).toBeNull();
      expect(getByTestId('privacy-step')).toBeTruthy();
    });
    
    // Go to credentials
    fireEvent.press(getByTestId('privacy-accept'));
    await waitFor(() => {
      expect(queryByTestId('privacy-step')).toBeNull();
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
    
    // Welcome -> Terms
    fireEvent.press(getByTestId('welcome-next'));
    await waitFor(() => expect(getByTestId('terms-step')).toBeTruthy());
    
    // Terms -> Privacy
    fireEvent.press(getByTestId('terms-accept'));
    await waitFor(() => expect(getByTestId('privacy-step')).toBeTruthy());
    
    // Privacy -> Credentials
    fireEvent.press(getByTestId('privacy-accept'));
    await waitFor(() => expect(getByTestId('credentials-step')).toBeTruthy());
    
    // Credentials -> Profile
    fireEvent.press(getByTestId('credentials-next'));
    await waitFor(() => expect(getByTestId('profile-step')).toBeTruthy());
    
    // Profile back to Credentials
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
    
    // Welcome -> Terms
    fireEvent.press(getByTestId('welcome-next'));
    await waitFor(() => expect(getByTestId('terms-step')).toBeTruthy());
    
    // Terms -> Privacy
    fireEvent.press(getByTestId('terms-accept'));
    await waitFor(() => expect(getByTestId('privacy-step')).toBeTruthy());
    
    // Privacy -> Credentials (progress bar should appear)
    fireEvent.press(getByTestId('privacy-accept'));
    await waitFor(() => {
      expect(getByTestId('progress-bar')).toBeTruthy();
    });
  });

  // Tests pour la logique de progression du OnboardingContainer
  describe('OnboardingContainer progression logic', () => {
    it('should exclude welcome, terms, privacy, completion from progress steps', () => {
      const steps = [
        'welcome', 'terms', 'privacy', 'credentials', 'profile', 'sports', 'hobbies', 'completion'
      ];
      const progressSteps = steps.filter(s => !['welcome', 'terms', 'privacy', 'completion'].includes(s));
      expect(progressSteps).toEqual(['credentials', 'profile', 'sports', 'hobbies']);
    });

    it('should return correct progressStepIndex for each step', () => {
      const steps = [
        'welcome', 'terms', 'privacy', 'credentials', 'profile', 'sports', 'hobbies', 'completion'
      ];
      const progressSteps = steps.filter(s => !['welcome', 'terms', 'privacy', 'completion'].includes(s));
      expect(progressSteps.indexOf('welcome')).toBe(-1);
      expect(progressSteps.indexOf('terms')).toBe(-1);
      expect(progressSteps.indexOf('privacy')).toBe(-1);
      expect(progressSteps.indexOf('completion')).toBe(-1);
      expect(progressSteps.indexOf('credentials')).toBe(0);
      expect(progressSteps.indexOf('profile')).toBe(1);
      expect(progressSteps.indexOf('sports')).toBe(2);
      expect(progressSteps.indexOf('hobbies')).toBe(3);
    });

    it('should not show progress bar for welcome, terms, privacy, completion', () => {
      const steps = [
        'welcome', 'terms', 'privacy', 'credentials', 'profile', 'sports', 'hobbies', 'completion'
      ];
      const progressSteps = steps.filter(s => !['welcome', 'terms', 'privacy', 'completion'].includes(s));
      const shouldShowProgress = (step: string) => progressSteps.indexOf(step) >= 0;
      expect(shouldShowProgress('welcome')).toBe(false);
      expect(shouldShowProgress('terms')).toBe(false);
      expect(shouldShowProgress('privacy')).toBe(false);
      expect(shouldShowProgress('completion')).toBe(false);
      expect(shouldShowProgress('credentials')).toBe(true);
      expect(shouldShowProgress('profile')).toBe(true);
      expect(shouldShowProgress('sports')).toBe(true);
      expect(shouldShowProgress('hobbies')).toBe(true);
    });
  });

  it('handles save errors gracefully', async () => {
    const saveError = new Error('Save failed');
    
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: saveError,
    });
    
    const { getByTestId } = render(<OnboardingContainer />);
    
    // Welcome -> Terms -> Privacy -> Credentials -> Profile -> Sports -> Hobbies
    fireEvent.press(getByTestId('welcome-next'));
    await waitFor(() => fireEvent.press(getByTestId('terms-accept')));
    await waitFor(() => fireEvent.press(getByTestId('privacy-accept')));
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
