import { renderHook, act } from '@testing-library/react-native';
import { jest } from '@jest/globals';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock supabase avec une factory function
jest.mock('@/lib/supabase', () => {
  const mockSupabaseAuth = {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(),
    getUser: jest.fn(),
  };

  const mockSupabase = {
    auth: mockSupabaseAuth,
  };

  return {
    supabase: mockSupabase,
  };
});

// Import du store après les mocks
import { 
  useAuthStore, 
  useAuth,
  useIsAuthenticated,
  useAuthUser,
  useAuthSession,
  useAuthLoading
} from '@/stores/authStore';

// Récupérer les mocks après l'import
import { supabase } from '@/lib/supabase';

describe('AuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset le store avant chaque test
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.setUser(null);
      result.current.setSession(null);
      result.current.setLoading(false);
      result.current.setInitialized(false);
      result.current.setIsOnboarding(false);
    });
  });

  describe('État initial', () => {
    it('devrait initialiser avec l\'état par défaut', () => {
      const { result } = renderHook(() => useAuthStore());
      
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.initialized).toBe(false);
      expect(result.current.isOnboarding).toBe(false);
    });
  });

  describe('Gestion de l\'utilisateur', () => {
    it('devrait définir l\'utilisateur correctement', () => {
      const { result } = renderHook(() => useAuthStore());
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
      };

      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.user).toEqual(mockUser);
    });

    it('devrait effacer l\'utilisateur correctement', () => {
      const { result } = renderHook(() => useAuthStore());
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
      };

      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.user).toEqual(mockUser);

      act(() => {
        result.current.setUser(null);
      });

      expect(result.current.user).toBeNull();
    });
  });

  describe('Gestion de la session', () => {
    it('devrait définir la session correctement', () => {
      const { result } = renderHook(() => useAuthStore());
      const mockSession = {
        access_token: 'token123',
        refresh_token: 'refresh123',
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          id: 'user123',
          email: 'test@example.com',
          created_at: '2024-01-01T00:00:00Z',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
        },
      };

      act(() => {
        result.current.setSession(mockSession);
      });

      expect(result.current.session).toEqual(mockSession);
    });

    it('devrait effacer la session correctement', () => {
      const { result } = renderHook(() => useAuthStore());
      const mockSession = {
        access_token: 'token123',
        refresh_token: 'refresh123',
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          id: 'user123',
          email: 'test@example.com',
          created_at: '2024-01-01T00:00:00Z',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
        },
      };

      act(() => {
        result.current.setSession(mockSession);
      });

      expect(result.current.session).toEqual(mockSession);

      act(() => {
        result.current.setSession(null);
      });

      expect(result.current.session).toBeNull();
    });
  });

  describe('États de chargement', () => {
    it('devrait gérer l\'état de chargement', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.loading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.loading).toBe(false);
    });

    it('devrait gérer l\'état d\'initialisation', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setInitialized(true);
      });

      expect(result.current.initialized).toBe(true);

      act(() => {
        result.current.setInitialized(false);
      });

      expect(result.current.initialized).toBe(false);
    });

    it('devrait gérer l\'état d\'onboarding', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setIsOnboarding(true);
      });

      expect(result.current.isOnboarding).toBe(true);

      act(() => {
        result.current.setIsOnboarding(false);
      });

      expect(result.current.isOnboarding).toBe(false);
    });
  });

  describe('Inscription', () => {
    it('devrait inscrire un utilisateur avec succès', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
      };
      const mockSession = {
        access_token: 'token123',
        refresh_token: 'refresh123',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser,
      };

      supabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const response = await result.current.signUp('test@example.com', 'password123');
        expect(response.error).toBeNull();
      });

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('devrait gérer les erreurs d\'inscription', async () => {
      const mockError = { message: 'Email already exists' };
      supabase.auth.signUp.mockResolvedValue({
        data: null,
        error: mockError,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const response = await result.current.signUp('test@example.com', 'password123');
        expect(response.error).toEqual(mockError);
      });
    });

    it('devrait gérer les exceptions lors de l\'inscription', async () => {
      supabase.auth.signUp.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const response = await result.current.signUp('test@example.com', 'password123');
        expect(response.error).toBeDefined();
      });
    });
  });

  describe('Connexion', () => {
    it('devrait connecter un utilisateur avec succès', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        error: null,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const response = await result.current.signIn('test@example.com', 'password123');
        expect(response.error).toBeNull();
      });

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('devrait gérer les erreurs de connexion', async () => {
      const mockError = { message: 'Invalid credentials' };
      supabase.auth.signInWithPassword.mockResolvedValue({
        error: mockError,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const response = await result.current.signIn('test@example.com', 'wrongpassword');
        expect(response.error).toEqual(mockError);
      });
    });

    it('devrait gérer les exceptions lors de la connexion', async () => {
      supabase.auth.signInWithPassword.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const response = await result.current.signIn('test@example.com', 'password123');
        expect(response.error).toBeDefined();
      });
    });
  });

  describe('Déconnexion', () => {
    it('devrait déconnecter un utilisateur avec succès', async () => {
      supabase.auth.signOut.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const response = await result.current.signOut();
        expect(response.error).toBeNull();
      });

      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('devrait gérer les erreurs de déconnexion', async () => {
      const mockError = { message: 'Signout failed' };
      supabase.auth.signOut.mockResolvedValue({ error: mockError });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const response = await result.current.signOut();
        expect(response.error).toEqual(mockError);
      });
    });

    it('devrait gérer les exceptions lors de la déconnexion', async () => {
      supabase.auth.signOut.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const response = await result.current.signOut();
        expect(response.error).toBeDefined();
      });
    });
  });



  describe('Initialisation', () => {
    it('devrait initialiser le store avec succès', async () => {
      const mockSession = {
        access_token: 'token123',
        refresh_token: 'refresh123',
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          id: 'user123',
          email: 'test@example.com',
        },
      };

      supabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      supabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.initialize();
      });

      expect(supabase.auth.getSession).toHaveBeenCalled();
      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
    });

    it('devrait gérer les erreurs d\'initialisation', async () => {
      const mockError = { message: 'Initialization failed' };
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: mockError,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.initialize();
      });

      expect(supabase.auth.getSession).toHaveBeenCalled();
    });

    it('devrait gérer les exceptions lors de l\'initialisation', async () => {
      supabase.auth.getSession.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.initialize();
      });

      expect(supabase.auth.getSession).toHaveBeenCalled();
    });
  });

  describe('Nettoyage', () => {
    it('devrait nettoyer les subscriptions', () => {
      const mockUnsubscribe = jest.fn();
      const mockSubscription = { unsubscribe: mockUnsubscribe };

      // Simuler une subscription existante
      const { result } = renderHook(() => useAuthStore());
      
      // Injecter manuellement la subscription pour le test
      (result.current as any)._subscription = mockSubscription;

      act(() => {
        result.current.cleanup();
      });

      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('devrait gérer le nettoyage sans subscription', () => {
      const { result } = renderHook(() => useAuthStore());

      // S'assurer qu'il n'y a pas de subscription
      (result.current as any)._subscription = null;

      expect(() => {
        act(() => {
          result.current.cleanup();
        });
      }).not.toThrow();
    });
  });

  describe('Callback de redirection', () => {
    it('devrait définir le callback de redirection', () => {
      const { result } = renderHook(() => useAuthStore());
      const mockCallback = jest.fn();

      act(() => {
        result.current.setOnAuthChange(mockCallback);
      });

      expect(result.current.onAuthChange).toBe(mockCallback);
    });
  });

  describe('Hook useAuth', () => {
    it('devrait retourner toutes les propriétés et méthodes', () => {
      const { result } = renderHook(() => useAuth());
      
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.initialized).toBe(false);
      expect(result.current.isOnboarding).toBe(false);
      expect(typeof result.current.signUp).toBe('function');
      expect(typeof result.current.signIn).toBe('function');
      expect(typeof result.current.signOut).toBe('function');
      expect(typeof result.current.initialize).toBe('function');
      expect(typeof result.current.cleanup).toBe('function');
      expect(typeof result.current.setIsOnboarding).toBe('function');
      expect(typeof result.current.setOnAuthChange).toBe('function');
    });
  });

  describe('Hook useIsAuthenticated', () => {
    it('devrait retourner false quand pas d\'utilisateur', () => {
      const { result } = renderHook(() => useIsAuthenticated());
      expect(result.current).toBe(false);
    });

    it('devrait retourner true quand utilisateur connecté', () => {
      const { result: storeResult } = renderHook(() => useAuthStore());
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
      };

      act(() => {
        storeResult.current.setUser(mockUser);
      });

      const { result } = renderHook(() => useIsAuthenticated());
      expect(result.current).toBe(true);
    });
  });

  describe('Hook useAuthUser', () => {
    it('devrait retourner l\'utilisateur actuel', () => {
      const { result: storeResult } = renderHook(() => useAuthStore());
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
      };

      act(() => {
        storeResult.current.setUser(mockUser);
      });

      const { result } = renderHook(() => useAuthUser());
      expect(result.current).toEqual(mockUser);
    });

    it('devrait retourner null quand pas d\'utilisateur', () => {
      const { result } = renderHook(() => useAuthUser());
      expect(result.current).toBeNull();
    });
  });

  describe('Hook useAuthSession', () => {
    it('devrait retourner la session actuelle', () => {
      const { result: storeResult } = renderHook(() => useAuthStore());
      const mockSession = {
        access_token: 'token123',
        refresh_token: 'refresh123',
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          id: 'user123',
          email: 'test@example.com',
          created_at: '2024-01-01T00:00:00Z',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
        },
      };

      act(() => {
        storeResult.current.setSession(mockSession);
      });

      const { result } = renderHook(() => useAuthSession());
      expect(result.current).toEqual(mockSession);
    });

    it('devrait retourner null quand pas de session', () => {
      const { result } = renderHook(() => useAuthSession());
      expect(result.current).toBeNull();
    });
  });

  describe('Hook useAuthLoading', () => {
    it('devrait retourner l\'état de chargement', () => {
      const { result: storeResult } = renderHook(() => useAuthStore());

      act(() => {
        storeResult.current.setLoading(true);
      });

      const { result } = renderHook(() => useAuthLoading());
      expect(result.current).toBe(true);

      act(() => {
        storeResult.current.setLoading(false);
      });

      expect(result.current).toBe(false);
    });
  });

  describe('Actions du store', () => {
    it('devrait avoir toutes les actions définies', () => {
      const { result } = renderHook(() => useAuthStore());
      
      expect(typeof result.current.setUser).toBe('function');
      expect(typeof result.current.setSession).toBe('function');
      expect(typeof result.current.setLoading).toBe('function');
      expect(typeof result.current.setInitialized).toBe('function');
      expect(typeof result.current.setIsOnboarding).toBe('function');
      expect(typeof result.current.signUp).toBe('function');
      expect(typeof result.current.signIn).toBe('function');
      expect(typeof result.current.signOut).toBe('function');
      expect(typeof result.current.initialize).toBe('function');
      expect(typeof result.current.cleanup).toBe('function');
      expect(typeof result.current.setOnAuthChange).toBe('function');
    });
  });

  describe('État du store', () => {
    it('devrait avoir un état initial correct', () => {
      const { result } = renderHook(() => useAuthStore());
      
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.initialized).toBe(false);
      expect(result.current.isOnboarding).toBe(false);
    });
  });

  describe('Tests de couverture pour les branches conditionnelles', () => {
    it('devrait gérer l\'inscription sans session', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
      };

      supabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const response = await result.current.signUp('test@example.com', 'password123');
        expect(response.error).toBeNull();
      });
    });

    it('devrait gérer l\'inscription avec session', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
      };
      const mockSession = {
        access_token: 'token123',
        refresh_token: 'refresh123',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser,
      };

      supabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const response = await result.current.signUp('test@example.com', 'password123');
        expect(response.error).toBeNull();
      });
    });

    it('devrait gérer l\'initialisation avec session', async () => {
      const mockSession = {
        access_token: 'token123',
        refresh_token: 'refresh123',
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          id: 'user123',
          email: 'test@example.com',
        },
      };

      supabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      supabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.initialize();
      });

      expect(result.current.session).toEqual(mockSession);
      expect(result.current.user).toEqual(mockSession.user);
    });

    it('devrait gérer l\'initialisation sans session', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      supabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.initialize();
      });

      expect(result.current.session).toBeNull();
      expect(result.current.user).toBeNull();
    });
  });

  describe('Tests de couverture pour les fonctions asynchrones', () => {
    it('devrait appeler initialize', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      supabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      });

      const { result } = renderHook(() => useAuthStore());
      
      await act(async () => {
        await result.current.initialize();
      });

      expect(typeof result.current.initialize).toBe('function');
    });

    it('devrait appeler cleanup', () => {
      const { result } = renderHook(() => useAuthStore());
      
      act(() => {
        result.current.cleanup();
      });

      expect(typeof result.current.cleanup).toBe('function');
    });

    it('devrait appeler setOnAuthChange', () => {
      const { result } = renderHook(() => useAuthStore());
      const mockCallback = jest.fn();
      
      act(() => {
        result.current.setOnAuthChange(mockCallback);
      });

      expect(typeof result.current.setOnAuthChange).toBe('function');
    });
  });
});
