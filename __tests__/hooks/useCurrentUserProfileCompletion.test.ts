import { renderHook, waitFor } from '@testing-library/react-native';
import { useCurrentUserProfileCompletion } from '@/hooks/useCurrentUserProfileCompletion';

// Mock authStore
jest.mock('@/stores/authStore', () => ({
  useAuthUser: jest.fn(),
}));

// Mock profileStore
jest.mock('@/stores/profileStore', () => ({
  useProfile: jest.fn(),
}));

describe('useCurrentUserProfileCompletion', () => {
  const mockUseAuthUser = require('@/stores/authStore').useAuthUser;
  const mockUseProfile = require('@/stores/profileStore').useProfile;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should return initial state when no user', () => {
      mockUseAuthUser.mockReturnValue(null);
      mockUseProfile.mockReturnValue({
        profile: null,
        hobbies: [],
        sports: [],
        loading: false,
      });

      const { result } = renderHook(() => useCurrentUserProfileCompletion());

      expect(result.current).toEqual({
        isComplete: false,
        isLoading: false,
        completionPercentage: 0,
        missingFields: ['utilisateur non connecté'],
        error: 'Utilisateur non connecté',
      });
    });

    it('should return initial state when user exists but no profile', () => {
      mockUseAuthUser.mockReturnValue({ id: 'user1' });
      mockUseProfile.mockReturnValue({
        profile: null,
        hobbies: [],
        sports: [],
        loading: false,
      });

      const { result } = renderHook(() => useCurrentUserProfileCompletion());

      expect(result.current).toEqual({
        isComplete: false,
        isLoading: false,
        completionPercentage: 0,
        missingFields: ['profil en cours de chargement'],
        error: null,
      });
    });

    it('should return loading state when profile is loading', () => {
      mockUseAuthUser.mockReturnValue({ id: 'user1' });
      mockUseProfile.mockReturnValue({
        profile: null,
        hobbies: [],
        sports: [],
        loading: true,
      });

      const { result } = renderHook(() => useCurrentUserProfileCompletion());

      expect(result.current).toEqual({
        isComplete: false,
        isLoading: true,
        completionPercentage: 0,
        missingFields: [],
        error: null,
      });
    });
  });

  describe('profile completion calculation', () => {
    it('should calculate 0% completion for empty profile', () => {
      mockUseAuthUser.mockReturnValue({ id: 'user1' });
      mockUseProfile.mockReturnValue({
        profile: {
          id_user: 'user1',
          firstname: null,
          lastname: null,
          birthdate: null,
          id_location: null,
        },
        hobbies: [],
        sports: [],
        loading: false,
      });

      const { result } = renderHook(() => useCurrentUserProfileCompletion());

      expect(result.current).toEqual({
        isComplete: false,
        isLoading: false,
        completionPercentage: 0,
        missingFields: ['nom/prénom', 'âge', 'localisation', 'sports', 'hobbies'],
        error: null,
      });
    });

    it('should calculate 20% completion with only name', () => {
      mockUseAuthUser.mockReturnValue({ id: 'user1' });
      mockUseProfile.mockReturnValue({
        profile: {
          id_user: 'user1',
          firstname: 'John',
          lastname: 'Doe',
          birthdate: null,
          id_location: null,
        },
        hobbies: [],
        sports: [],
        loading: false,
      });

      const { result } = renderHook(() => useCurrentUserProfileCompletion());

      expect(result.current).toEqual({
        isComplete: false,
        isLoading: false,
        completionPercentage: 20,
        missingFields: ['âge', 'localisation', 'sports', 'hobbies'],
        error: null,
      });
    });

    it('should calculate 40% completion with name and age', () => {
      mockUseAuthUser.mockReturnValue({ id: 'user1' });
      mockUseProfile.mockReturnValue({
        profile: {
          id_user: 'user1',
          firstname: 'John',
          lastname: 'Doe',
          birthdate: '1990-01-01',
          id_location: null,
        },
        hobbies: [],
        sports: [],
        loading: false,
      });

      const { result } = renderHook(() => useCurrentUserProfileCompletion());

      expect(result.current).toEqual({
        isComplete: false,
        isLoading: false,
        completionPercentage: 40,
        missingFields: ['localisation', 'sports', 'hobbies'],
        error: null,
      });
    });

    it('should calculate 60% completion with name, age and location', () => {
      mockUseAuthUser.mockReturnValue({ id: 'user1' });
      mockUseProfile.mockReturnValue({
        profile: {
          id_user: 'user1',
          firstname: 'John',
          lastname: 'Doe',
          birthdate: '1990-01-01',
          id_location: 1,
        },
        hobbies: [],
        sports: [],
        loading: false,
      });

      const { result } = renderHook(() => useCurrentUserProfileCompletion());

      expect(result.current).toEqual({
        isComplete: false,
        isLoading: false,
        completionPercentage: 60,
        missingFields: ['sports', 'hobbies'],
        error: null,
      });
    });

    it('should calculate 80% completion with name, age, location and sports', () => {
      mockUseAuthUser.mockReturnValue({ id: 'user1' });
      mockUseProfile.mockReturnValue({
        profile: {
          id_user: 'user1',
          firstname: 'John',
          lastname: 'Doe',
          birthdate: '1990-01-01',
          id_location: 1,
        },
        hobbies: [],
        sports: [{ id: 1, name: 'Football' }],
        loading: false,
      });

      const { result } = renderHook(() => useCurrentUserProfileCompletion());

      expect(result.current).toEqual({
        isComplete: false,
        isLoading: false,
        completionPercentage: 80,
        missingFields: ['hobbies'],
        error: null,
      });
    });

    it('should calculate 100% completion with all fields', () => {
      mockUseAuthUser.mockReturnValue({ id: 'user1' });
      mockUseProfile.mockReturnValue({
        profile: {
          id_user: 'user1',
          firstname: 'John',
          lastname: 'Doe',
          birthdate: '1990-01-01',
          id_location: 1,
        },
        hobbies: [{ id: 1, name: 'Reading' }],
        sports: [{ id: 1, name: 'Football' }],
        loading: false,
      });

      const { result } = renderHook(() => useCurrentUserProfileCompletion());

      expect(result.current).toEqual({
        isComplete: true,
        isLoading: false,
        completionPercentage: 100,
        missingFields: [],
        error: null,
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty firstname', () => {
      mockUseAuthUser.mockReturnValue({ id: 'user1' });
      mockUseProfile.mockReturnValue({
        profile: {
          id_user: 'user1',
          firstname: '',
          lastname: 'Doe',
          birthdate: '1990-01-01',
          id_location: 1,
        },
        hobbies: [{ id: 1, name: 'Reading' }],
        sports: [{ id: 1, name: 'Football' }],
        loading: false,
      });

      const { result } = renderHook(() => useCurrentUserProfileCompletion());

      expect(result.current.missingFields).toContain('nom/prénom');
      expect(result.current.isComplete).toBe(false);
    });

    it('should handle empty lastname', () => {
      mockUseAuthUser.mockReturnValue({ id: 'user1' });
      mockUseProfile.mockReturnValue({
        profile: {
          id_user: 'user1',
          firstname: 'John',
          lastname: '',
          birthdate: '1990-01-01',
          id_location: 1,
        },
        hobbies: [{ id: 1, name: 'Reading' }],
        sports: [{ id: 1, name: 'Football' }],
        loading: false,
      });

      const { result } = renderHook(() => useCurrentUserProfileCompletion());

      expect(result.current.missingFields).toContain('nom/prénom');
      expect(result.current.isComplete).toBe(false);
    });

    it('should handle null birthdate', () => {
      mockUseAuthUser.mockReturnValue({ id: 'user1' });
      mockUseProfile.mockReturnValue({
        profile: {
          id_user: 'user1',
          firstname: 'John',
          lastname: 'Doe',
          birthdate: null,
          id_location: 1,
        },
        hobbies: [{ id: 1, name: 'Reading' }],
        sports: [{ id: 1, name: 'Football' }],
        loading: false,
      });

      const { result } = renderHook(() => useCurrentUserProfileCompletion());

      expect(result.current.missingFields).toContain('âge');
      expect(result.current.isComplete).toBe(false);
    });

    it('should handle null location', () => {
      mockUseAuthUser.mockReturnValue({ id: 'user1' });
      mockUseProfile.mockReturnValue({
        profile: {
          id_user: 'user1',
          firstname: 'John',
          lastname: 'Doe',
          birthdate: '1990-01-01',
          id_location: null,
        },
        hobbies: [{ id: 1, name: 'Reading' }],
        sports: [{ id: 1, name: 'Football' }],
        loading: false,
      });

      const { result } = renderHook(() => useCurrentUserProfileCompletion());

      expect(result.current.missingFields).toContain('localisation');
      expect(result.current.isComplete).toBe(false);
    });

    it('should handle empty sports array', () => {
      mockUseAuthUser.mockReturnValue({ id: 'user1' });
      mockUseProfile.mockReturnValue({
        profile: {
          id_user: 'user1',
          firstname: 'John',
          lastname: 'Doe',
          birthdate: '1990-01-01',
          id_location: 1,
        },
        hobbies: [{ id: 1, name: 'Reading' }],
        sports: [],
        loading: false,
      });

      const { result } = renderHook(() => useCurrentUserProfileCompletion());

      expect(result.current.missingFields).toContain('sports');
      expect(result.current.isComplete).toBe(false);
    });

    it('should handle empty hobbies array', () => {
      mockUseAuthUser.mockReturnValue({ id: 'user1' });
      mockUseProfile.mockReturnValue({
        profile: {
          id_user: 'user1',
          firstname: 'John',
          lastname: 'Doe',
          birthdate: '1990-01-01',
          id_location: 1,
        },
        hobbies: [],
        sports: [{ id: 1, name: 'Football' }],
        loading: false,
      });

      const { result } = renderHook(() => useCurrentUserProfileCompletion());

      expect(result.current.missingFields).toContain('hobbies');
      expect(result.current.isComplete).toBe(false);
    });

    it('should handle null hobbies', () => {
      mockUseAuthUser.mockReturnValue({ id: 'user1' });
      mockUseProfile.mockReturnValue({
        profile: {
          id_user: 'user1',
          firstname: 'John',
          lastname: 'Doe',
          birthdate: '1990-01-01',
          id_location: 1,
        },
        hobbies: null,
        sports: [{ id: 1, name: 'Football' }],
        loading: false,
      });

      const { result } = renderHook(() => useCurrentUserProfileCompletion());

      expect(result.current.missingFields).toContain('hobbies');
      expect(result.current.isComplete).toBe(false);
    });

    it('should handle null sports', () => {
      mockUseAuthUser.mockReturnValue({ id: 'user1' });
      mockUseProfile.mockReturnValue({
        profile: {
          id_user: 'user1',
          firstname: 'John',
          lastname: 'Doe',
          birthdate: '1990-01-01',
          id_location: 1,
        },
        hobbies: [{ id: 1, name: 'Reading' }],
        sports: null,
        loading: false,
      });

      const { result } = renderHook(() => useCurrentUserProfileCompletion());

      expect(result.current.missingFields).toContain('sports');
      expect(result.current.isComplete).toBe(false);
    });
  });

  describe('percentage calculation', () => {
    it('should round percentage correctly', () => {
      mockUseAuthUser.mockReturnValue({ id: 'user1' });
      mockUseProfile.mockReturnValue({
        profile: {
          id_user: 'user1',
          firstname: 'John',
          lastname: 'Doe',
          birthdate: '1990-01-01',
          id_location: 1,
        },
        hobbies: [{ id: 1, name: 'Reading' }],
        sports: [],
        loading: false,
      });

      const { result } = renderHook(() => useCurrentUserProfileCompletion());

      // 4 out of 5 fields = 80%
      expect(result.current.completionPercentage).toBe(80);
    });

    it('should handle 0% completion', () => {
      mockUseAuthUser.mockReturnValue({ id: 'user1' });
      mockUseProfile.mockReturnValue({
        profile: {
          id_user: 'user1',
          firstname: null,
          lastname: null,
          birthdate: null,
          id_location: null,
        },
        hobbies: [],
        sports: [],
        loading: false,
      });

      const { result } = renderHook(() => useCurrentUserProfileCompletion());

      expect(result.current.completionPercentage).toBe(0);
    });

    it('should handle 100% completion', () => {
      mockUseAuthUser.mockReturnValue({ id: 'user1' });
      mockUseProfile.mockReturnValue({
        profile: {
          id_user: 'user1',
          firstname: 'John',
          lastname: 'Doe',
          birthdate: '1990-01-01',
          id_location: 1,
        },
        hobbies: [{ id: 1, name: 'Reading' }],
        sports: [{ id: 1, name: 'Football' }],
        loading: false,
      });

      const { result } = renderHook(() => useCurrentUserProfileCompletion());

      expect(result.current.completionPercentage).toBe(100);
    });
  });
}); 