import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => ({
  __esModule: true,
  default: function MockDateTimePicker({ value, onChange }: any) {
    const React = require('react');
    const { View, TouchableOpacity, Text } = require('react-native');
    
    return (
      <View testID="date-picker">
        <TouchableOpacity
          testID="date-picker-change"
          onPress={() => onChange({}, new Date('1995-06-15'))}
        >
          <Text>Change Date</Text>
        </TouchableOpacity>
      </View>
    );
  },
}));

// Mock locationService with proper hoisting
const mockLocationService = {
  showLocationExplanation: jest.fn(),
  getCurrentLocation: jest.fn(),
};

jest.mock('@/services/locationService', () => ({
  locationService: mockLocationService,
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

// Import component after mocks are set up
import OnboardingProfile from '@/components/onboarding/steps/OnboardingProfile';

const mockOnNext = jest.fn();
const mockOnBack = jest.fn();

describe('OnboardingProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset and setup default mocks
    mockLocationService.showLocationExplanation.mockReset();
    mockLocationService.getCurrentLocation.mockReset();
    
    mockLocationService.showLocationExplanation.mockResolvedValue(true);
    mockLocationService.getCurrentLocation.mockResolvedValue({
      success: true,
      data: {
        town: 'Paris',
        postal_code: 75001,
        latitude: 48.8566,
        longitude: 2.3522,
      },
    });
  });

  it('renders form elements correctly', () => {
    const { getByText, getByPlaceholderText } = render(
      <OnboardingProfile
        
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );
    
    expect(getByText('Créez votre profil')).toBeTruthy();
    expect(getByText(/Partagez quelques informations/)).toBeTruthy();
    expect(getByPlaceholderText('Votre prénom')).toBeTruthy();
    expect(getByPlaceholderText('Votre nom')).toBeTruthy();
    expect(getByText('Date de naissance *')).toBeTruthy();
  });

  it('initializes with default date (18 years ago)', () => {
    const { getByText } = render(
      <OnboardingProfile
        
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );
    
    // Should show a date that's approximately 18 years ago
    const today = new Date();
    const expectedYear = today.getFullYear() - 18;
    expect(getByText(new RegExp(expectedYear.toString()))).toBeTruthy();
  });

  it('updates form fields correctly', () => {
    const { getByPlaceholderText } = render(
      <OnboardingProfile
        
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );
    
    const firstnameInput = getByPlaceholderText('Votre prénom');
    const lastnameInput = getByPlaceholderText('Votre nom');
    
    fireEvent.changeText(firstnameInput, 'John');
    fireEvent.changeText(lastnameInput, 'Doe');
    
    expect(firstnameInput.props.value).toBe('John');
    expect(lastnameInput.props.value).toBe('Doe');
  });

  it('validates required fields', async () => {
    const { getByText } = render(
      <OnboardingProfile
        
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );
    
    fireEvent.press(getByText('Continuer'));
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Erreur de validation',
        expect.stringContaining('Le prénom est requis')
      );
    });
  });

  it('validates minimum age', async () => {
    const { getByPlaceholderText, getByText } = render(
      <OnboardingProfile
        
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );
    
    // Fill required fields
    fireEvent.changeText(getByPlaceholderText('Votre prénom'), 'John');
    fireEvent.changeText(getByPlaceholderText('Votre nom'), 'Doe');
    
    // Set date to show picker - fix regex pattern
    const dateButtons = getByText(/\d{2}\/\d{2}\/\d{4}/);
    fireEvent.press(dateButtons);
    
    // The validation should pass with default 18-year-old date
    fireEvent.press(getByText('Continuer'));
    
    await waitFor(() => {
      expect(mockOnNext).toHaveBeenCalled();
    });
  });

  it('calls onNext with correct data', async () => {
    const { getByPlaceholderText, getByText } = render(
      <OnboardingProfile
        
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );
    
    // Fill form
    fireEvent.changeText(getByPlaceholderText('Votre prénom'), 'John');
    fireEvent.changeText(getByPlaceholderText('Votre nom'), 'Doe');
    
    fireEvent.press(getByText('Continuer'));
    
    await waitFor(() => {
      expect(mockOnNext).toHaveBeenCalledWith(
        expect.objectContaining({
          firstname: 'John',
          lastname: 'Doe',
          birthdate: expect.any(Date),
        })
      );
    });
  });

  it('calls onBack when back button is pressed', () => {
    const { getByText } = render(
      <OnboardingProfile
        
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );
    
    fireEvent.press(getByText('Retour'));
    expect(mockOnBack).toHaveBeenCalled();
  });
});