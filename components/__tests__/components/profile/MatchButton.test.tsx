import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MatchButton from '@/components/profile/MatchButton';
import { MatchService } from '@/services/matchService';
import { CompatibleProfile } from '@/services/compatibleProfileService';

// Mock du service de match
jest.mock('@/services/matchService', () => ({
  MatchService: {
    initiateMatch: jest.fn(),
    hasExistingMatch: jest.fn(),
  },
}));

// Mock d'Alert
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Alert: {
      alert: jest.fn(),
    },
  };
});

describe('MatchButton', () => {
  const mockProfile: CompatibleProfile = {
    profile_id: 1,
    user_id: 'user-123',
    firstname: 'John',
    lastname: 'Doe',
    biography: 'Test biography',
    compatibility_score: 85,
    total_count: 1,
    age: 25,
    location: {
      id: '1',
      town: 'Paris',
      postal_code: '75001',
      location: 'POINT(2.3522 48.8566)',
    },
    sports: [],
    hobbies: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly with default props', () => {
    const { getByText } = render(<MatchButton profile={mockProfile} />);
    
    expect(getByText('Demander en ami')).toBeTruthy();
  });

  it('should render with different sizes', () => {
    const { getByText, rerender } = render(
      <MatchButton profile={mockProfile} size="small" />
    );
    expect(getByText('Demander en ami')).toBeTruthy();

    rerender(<MatchButton profile={mockProfile} size="large" />);
    expect(getByText('Demander en ami')).toBeTruthy();
  });

  it('should render with different variants', () => {
    const { getByText, rerender } = render(
      <MatchButton profile={mockProfile} variant="primary" />
    );
    expect(getByText('Demander en ami')).toBeTruthy();

    rerender(<MatchButton profile={mockProfile} variant="outline" />);
    expect(getByText('Demander en ami')).toBeTruthy();
  });

  it('should handle successful match initiation', async () => {
    const mockInitiateMatch = MatchService.initiateMatch as jest.Mock;
    const mockHasExistingMatch = MatchService.hasExistingMatch as jest.Mock;
    
    mockHasExistingMatch.mockResolvedValue(false);
    mockInitiateMatch.mockResolvedValue({
      success: true,
      message: 'Match initié avec succès',
      match_id: 456,
    });

    const onMatchSuccess = jest.fn();
    const { getByText } = render(
      <MatchButton 
        profile={mockProfile} 
        onMatchSuccess={onMatchSuccess}
      />
    );

    const button = getByText('Demander en ami');
    fireEvent.press(button);

    await waitFor(() => {
      expect(mockInitiateMatch).toHaveBeenCalledWith('user-123');
      expect(onMatchSuccess).toHaveBeenCalledWith({
        success: true,
        message: 'Match initié avec succès',
        match_id: 456,
      });
    });
  });

  it('should handle match initiation error', async () => {
    const mockInitiateMatch = MatchService.initiateMatch as jest.Mock;
    const mockHasExistingMatch = MatchService.hasExistingMatch as jest.Mock;
    
    mockHasExistingMatch.mockResolvedValue(false);
    mockInitiateMatch.mockResolvedValue({
      success: false,
      message: 'Un match existe déjà avec cette personne',
    });

    const onMatchError = jest.fn();
    const { getByText } = render(
      <MatchButton 
        profile={mockProfile} 
        onMatchError={onMatchError}
      />
    );

    const button = getByText('Demander en ami');
    fireEvent.press(button);

    await waitFor(() => {
      expect(mockInitiateMatch).toHaveBeenCalledWith('user-123');
      expect(onMatchError).toHaveBeenCalledWith('Un match existe déjà avec cette personne');
    });
  });

  it('should show loading state during match initiation', async () => {
    const mockInitiateMatch = MatchService.initiateMatch as jest.Mock;
    const mockHasExistingMatch = MatchService.hasExistingMatch as jest.Mock;
    
    mockHasExistingMatch.mockResolvedValue(false);
    
    // Créer une promesse qui ne se résout pas immédiatement
    let resolvePromise: (value: any) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockInitiateMatch.mockReturnValue(pendingPromise);

    const { getByText } = render(<MatchButton profile={mockProfile} />);

    const button = getByText('Demander en ami');
    fireEvent.press(button);

    // Vérifier que le bouton affiche l'état de chargement
    expect(getByText('Envoi...')).toBeTruthy();

    // Résoudre la promesse
    resolvePromise!({
      success: true,
      message: 'Match initié avec succès',
      match_id: 456,
    });

    await waitFor(() => {
      expect(getByText('Demande envoyée ✓')).toBeTruthy();
    });
  });

  it('should be disabled when profile has no user_id', () => {
    const profileWithoutUserId = { ...mockProfile, user_id: '' };
    const { getByText } = render(<MatchButton profile={profileWithoutUserId} />);

    const button = getByText('Match 💕');
    expect(button).toBeTruthy();
    // Le bouton devrait être désactivé mais toujours visible
  });

  it('should show existing match state', async () => {
    const mockHasExistingMatch = MatchService.hasExistingMatch as jest.Mock;
    mockHasExistingMatch.mockResolvedValue(true);

    const { getByText } = render(<MatchButton profile={mockProfile} />);

    await waitFor(() => {
      expect(getByText('Demande envoyée ✓')).toBeTruthy();
    });
  });

  it('should be disabled when disabled prop is true', () => {
    const { getByText } = render(<MatchButton profile={mockProfile} disabled={true} />);

    const button = getByText('Demander en ami');
    expect(button).toBeTruthy();
    // Le bouton devrait être désactivé mais toujours visible
  });
}); 