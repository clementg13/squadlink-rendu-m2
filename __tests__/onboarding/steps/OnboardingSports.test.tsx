import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

// Mock data
const mockSports = [
  { id: '1', name: 'Football' },
  { id: '2', name: 'Basketball' },
  { id: '3', name: 'Tennis' },
];

const mockSportLevels = [
  { id: '1', name: 'Débutant' },
  { id: '2', name: 'Intermédiaire' },
  { id: '3', name: 'Avancé' },
];

// Create chainable mock methods
const createMockChain = (data: any[], error: any = null) => ({
  select: jest.fn().mockReturnThis(),
  order: jest.fn().mockResolvedValue({ data, error }),
});

// Mock supabase with proper hoisting
const mockSupabase = {
  from: jest.fn()
    .mockReturnValueOnce(createMockChain(mockSports))
    .mockReturnValueOnce(createMockChain(mockSportLevels)),
};

jest.mock('../../../lib/supabase', () => ({
  supabase: mockSupabase,
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

// Import component after mocks
import OnboardingSports from '@/components/onboarding/steps/OnboardingSports';

const mockOnNext = jest.fn();
const mockOnBack = jest.fn();

describe('OnboardingSports', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset and setup mocks for each test
    mockSupabase.from.mockReset();
    mockSupabase.from
      .mockReturnValueOnce(createMockChain(mockSports))
      .mockReturnValueOnce(createMockChain(mockSportLevels));
  });

  it('shows sports counter', async () => {
    const { getByText } = render(
      <OnboardingSports
        
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );
    
    await waitFor(() => {
      expect(getByText('0/5 sports sélectionnés')).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('calls onBack when back button is pressed', async () => {
    const { getByText } = render(
      <OnboardingSports
        
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );
    
    await waitFor(() => {
      expect(getByText('Retour')).toBeTruthy();
    }, { timeout: 3000 });
    
    fireEvent.press(getByText('Retour'));
    expect(mockOnBack).toHaveBeenCalled();
  });

  it('handles API errors gracefully', async () => {
    mockSupabase.from.mockReset();
    mockSupabase.from.mockReturnValueOnce(createMockChain([], { message: 'Network error' }));
    
    render(
      <OnboardingSports
        
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Erreur',
        'Impossible de charger les sports disponibles'
      );
    }, { timeout: 3000 });
  });
});

  it('shows sports counter', async () => {
    const { getByText } = render(
      <OnboardingSports
        
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );
    
    await waitFor(() => {
      expect(getByText('0/5 sports sélectionnés')).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('calls onBack when back button is pressed', async () => {
    const { getByText } = render(
      <OnboardingSports
        
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );
    
    await waitFor(() => {
      expect(getByText('Retour')).toBeTruthy();
    }, { timeout: 3000 });
    
    fireEvent.press(getByText('Retour'));
    expect(mockOnBack).toHaveBeenCalled();
  });

  it('handles API errors gracefully', async () => {
    mockSupabase.from.mockReset();
    mockSupabase.from.mockReturnValueOnce(createMockChain([], { message: 'Network error' }));
    
    render(
      <OnboardingSports
        
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Erreur',
        'Impossible de charger les sports disponibles'
      );
    }, { timeout: 3000 });
  });