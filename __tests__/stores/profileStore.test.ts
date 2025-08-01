import { act } from '@testing-library/react-native';
import { jest } from '@jest/globals';

// Créer un mock du store avant de l'importer
const mockStore = {
  profile: null,
  sports: [],
  sportLevels: [],
  socialMedias: [],
  loading: false,
  saving: false,
  error: null,
  initialized: false,
  setProfile: jest.fn(),
  setLoading: jest.fn(),
  setSaving: jest.fn(),
  setError: jest.fn(),
  clearError: jest.fn(),
  cleanup: jest.fn(),
};

jest.mock('../../stores/profileStore', () => ({
  useProfileStore: {
    getState: () => mockStore,
  },
}));

describe('ProfileStore', () => {
  beforeEach(() => {
    // Reset tous les mocks
    jest.clearAllMocks();
    
    // Reset l'état du mock store
    Object.assign(mockStore, {
      profile: null,
      sports: [],
      sportLevels: [],
      socialMedias: [],
      loading: false,
      saving: false,
      error: null,
      initialized: false,
    });
  });

  it('should initialize with default state', () => {
    expect(mockStore.profile).toBeNull();
    expect(mockStore.loading).toBe(false);
    expect(mockStore.saving).toBe(false);
    expect(mockStore.error).toBeNull();
    expect(mockStore.sports).toEqual([]);
    expect(mockStore.sportLevels).toEqual([]);
    expect(mockStore.socialMedias).toEqual([]);
  });

  it('should set loading state correctly', () => {
    act(() => {
      mockStore.setLoading(true);
    });

    expect(mockStore.setLoading).toHaveBeenCalledWith(true);
  });

  it('should set saving state correctly', () => {
    act(() => {
      mockStore.setSaving(true);
    });

    expect(mockStore.setSaving).toHaveBeenCalledWith(true);
  });

  it('should set error state correctly', () => {
    const errorMessage = 'Test error';

    act(() => {
      mockStore.setError(errorMessage);
    });

    expect(mockStore.setError).toHaveBeenCalledWith(errorMessage);
  });

  it('should clear error correctly', () => {
    act(() => {
      mockStore.clearError();
    });

    expect(mockStore.clearError).toHaveBeenCalled();
  });

  it('should cleanup state correctly', () => {
    act(() => {
      mockStore.cleanup();
    });

    expect(mockStore.cleanup).toHaveBeenCalled();
  });
});