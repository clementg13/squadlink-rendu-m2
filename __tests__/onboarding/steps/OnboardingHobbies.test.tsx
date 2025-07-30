import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

// Mock data
const mockHobbies = [
  { id: '1', name: 'Lecture' },
  { id: '2', name: 'Musique' },
  { id: '3', name: 'Cuisine' },
];

// Create chainable mock methods
const createMockChain = (data: any[], error: any = null) => ({
  select: jest.fn().mockReturnThis(),
  order: jest.fn().mockResolvedValue({ data, error }),
});

const mockSupabase = {
  from: jest.fn(),
};

jest.mock('../../../../lib/supabase', () => ({
  supabase: mockSupabase,
}));

jest.spyOn(Alert, 'alert');

import OnboardingHobbies from '../../../onboarding/steps/OnboardingHobbies';

const mockOnNext = jest.fn();
const mockOnBack = jest.fn();

describe('OnboardingHobbies', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock to return hobbies data
    mockSupabase.from.mockReturnValue(createMockChain(mockHobbies));
  });

  it('renders hobbies content correctly', async () => {
    const { getByText } = render(
      <OnboardingHobbies
        
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    await waitFor(
      () => {
        expect(getByText("Vos centres d'intérêt")).toBeTruthy();
        expect(getByText(/Sélectionnez vos hobbies pour trouver/)).toBeTruthy();
      },
      { timeout: 10000 }
    );
  });

  it('shows hobby counter', async () => {
    const { getByText } = render(
      <OnboardingHobbies
        
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    await waitFor(
      () => {
        expect(getByText('0/10 hobbies sélectionnés')).toBeTruthy();
      },
      { timeout: 10000 }
    );
  });

  it('validates minimum selection', async () => {
    const { getByText } = render(
      <OnboardingHobbies
        
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    await waitFor(
      () => {
        expect(getByText('Passer cette étape')).toBeTruthy();
      },
      { timeout: 10000 }
    );

    fireEvent.press(getByText('Passer cette étape'));

    // Since it's optional, it should call onNext with empty array
    expect(mockOnNext).toHaveBeenCalledWith([]);
  });

  it('calls onBack when back button is pressed', async () => {
    const { getByText } = render(
      <OnboardingHobbies
        
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(getByText('Retour')).toBeTruthy();
    });

    fireEvent.press(getByText('Retour'));
    expect(mockOnBack).toHaveBeenCalled();
  });
});

  it('validates minimum selection', async () => {
    const { getByText } = render(
      <OnboardingHobbies
        
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    await waitFor(
      () => {
        expect(getByText('Passer cette étape')).toBeTruthy();
      },
      { timeout: 10000 }
    );

    fireEvent.press(getByText('Passer cette étape'));

    // Since it's optional, it should call onNext with empty array
    expect(mockOnNext).toHaveBeenCalledWith([]);
  });

  it('calls onBack when back button is pressed', async () => {
    const { getByText } = render(
      <OnboardingHobbies
        
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(getByText('Retour')).toBeTruthy();
    });

    fireEvent.press(getByText('Retour'));
    expect(mockOnBack).toHaveBeenCalled();
  });
