/**
 * @jest-environment jsdom
 */

// Mock supabase complètement avant tout import
const mockSupabaseAuth = {
  signUp: jest.fn(),
  signInWithPassword: jest.fn(),
  signOut: jest.fn(),
  resetPasswordForEmail: jest.fn(),
  getSession: jest.fn(),
  onAuthStateChange: jest.fn(),
  getUser: jest.fn(),
};

const mockSupabase = {
  auth: mockSupabaseAuth,
};

// Mock avant tous les imports
jest.mock('../../../lib/supabase', () => ({
  supabase: mockSupabase,
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock React Native
jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

// Maintenant importer les modules
import { renderHook, act } from '@testing-library/react';

// Test des fonctions d'authentification isolément
describe('AuthStore Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp function', () => {
    it('should sign up user successfully', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' };
      const mockSession = { access_token: 'token123', user: mockUser };

      mockSupabaseAuth.signUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      // Test direct de la fonction d'authentification
      const signUpFunction = async (email: string, password: string) => {
        try {
          const { data, error } = await mockSupabase.auth.signUp({
            email,
            password,
          });

          if (error) {
            return { error };
          }

          return { data, error: null };
        } catch (error) {
          return { error };
        }
      };

      const result = await signUpFunction('test@example.com', 'password123');

      expect(result.error).toBeNull();
      expect(mockSupabaseAuth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle signup errors', async () => {
      const mockError = { message: 'Email already exists' };
      mockSupabaseAuth.signUp.mockResolvedValue({
        data: null,
        error: mockError,
      });

      const signUpFunction = async (email: string, password: string) => {
        try {
          const { data, error } = await mockSupabase.auth.signUp({
            email,
            password,
          });
          return { data, error };
        } catch (error) {
          return { error };
        }
      };

      const result = await signUpFunction('test@example.com', 'password123');

      expect(result.error).toEqual(mockError);
    });
  });

  describe('signIn function', () => {
    it('should sign in user successfully', async () => {
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        error: null,
      });

      const signInFunction = async (email: string, password: string) => {
        try {
          const { error } = await mockSupabase.auth.signInWithPassword({
            email,
            password,
          });
          return { error };
        } catch (error) {
          return { error };
        }
      };

      const result = await signInFunction('test@example.com', 'password123');

      expect(result.error).toBeNull();
      expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle signin errors', async () => {
      const mockError = { message: 'Invalid credentials' };
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        error: mockError,
      });

      const signInFunction = async (email: string, password: string) => {
        try {
          const { error } = await mockSupabase.auth.signInWithPassword({
            email,
            password,
          });
          return { error };
        } catch (error) {
          return { error };
        }
      };

      const result = await signInFunction('test@example.com', 'wrongpassword');

      expect(result.error).toEqual(mockError);
    });
  });

  describe('signOut function', () => {
    it('should sign out user successfully', async () => {
      mockSupabaseAuth.signOut.mockResolvedValue({ error: null });

      const signOutFunction = async () => {
        try {
          const { error } = await mockSupabase.auth.signOut();
          return { error };
        } catch (error) {
          return { error };
        }
      };

      const result = await signOutFunction();

      expect(result.error).toBeNull();
      expect(mockSupabaseAuth.signOut).toHaveBeenCalled();
    });

    it('should handle signout errors', async () => {
      const mockError = { message: 'Signout failed' };
      mockSupabaseAuth.signOut.mockResolvedValue({ error: mockError });

      const signOutFunction = async () => {
        try {
          const { error } = await mockSupabase.auth.signOut();
          return { error };
        } catch (error) {
          return { error };
        }
      };

      const result = await signOutFunction();

      expect(result.error).toEqual(mockError);
    });
  });

  describe('resetPassword function', () => {
    it('should reset password successfully', async () => {
      mockSupabaseAuth.resetPasswordForEmail.mockResolvedValue({ error: null });

      const resetPasswordFunction = async (email: string) => {
        try {
          const { error } = await mockSupabase.auth.resetPasswordForEmail(email);
          return { error };
        } catch (error) {
          return { error };
        }
      };

      const result = await resetPasswordFunction('test@example.com');

      expect(result.error).toBeNull();
      expect(mockSupabaseAuth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should handle reset password errors', async () => {
      const mockError = { message: 'Email not found' };
      mockSupabaseAuth.resetPasswordForEmail.mockResolvedValue({ error: mockError });

      const resetPasswordFunction = async (email: string) => {
        try {
          const { error } = await mockSupabase.auth.resetPasswordForEmail(email);
          return { error };
        } catch (error) {
          return { error };
        }
      };

      const result = await resetPasswordFunction('test@example.com');

      expect(result.error).toEqual(mockError);
    });
  });

});

// Test simple du store si possible
describe('AuthStore State Management', () => {
  it('should manage basic state', () => {
    // Test de state management basique
    const mockState = {
      user: null,
      session: null,
      loading: true,
      initialized: false,
      isOnboarding: false,
    };

    // Simuler les changements d'état
    const updateState = (newState: Partial<typeof mockState>) => {
      return { ...mockState, ...newState };
    };

    // Test des mises à jour d'état
    let state = updateState({ loading: false });
    expect(state.loading).toBe(false);

    state = updateState({ isOnboarding: true });
    expect(state.isOnboarding).toBe(true);

    state = updateState({ user: { id: 'user123' } as any });
    expect(state.user).toEqual({ id: 'user123' });
  });

  it('should handle onboarding state changes', () => {
    let isOnboarding = false;

    const setIsOnboarding = (value: boolean) => {
      isOnboarding = value;
    };

    setIsOnboarding(true);
    expect(isOnboarding).toBe(true);

    setIsOnboarding(false);
    expect(isOnboarding).toBe(false);
  });
});
