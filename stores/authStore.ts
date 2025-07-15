import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// Types pour le store d'authentification
interface AuthState {
  // État
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  
  // Méthodes d'authentification
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  
  // Méthodes utilitaires
  initialize: () => Promise<void>;
  cleanup: () => void;
}

// Créer le store avec persistance
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // État initial
      user: null,
      session: null,
      loading: true,
      initialized: false,

      // Actions de base
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ loading }),
      setInitialized: (initialized) => set({ initialized }),

      // Inscription
      signUp: async (email: string, password: string) => {
        try {
          set({ loading: true });
          const { error } = await supabase.auth.signUp({
            email,
            password,
          });
          return { error };
        } catch (error) {
          console.error('Erreur lors de l\'inscription:', error);
          return { error: error as AuthError };
        } finally {
          set({ loading: false });
        }
      },

      // Connexion
      signIn: async (email: string, password: string) => {
        try {
          set({ loading: true });
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          return { error };
        } catch (error) {
          console.error('Erreur lors de la connexion:', error);
          return { error: error as AuthError };
        } finally {
          set({ loading: false });
        }
      },

      // Déconnexion
      signOut: async () => {
        try {
          set({ loading: true });
          const { error } = await supabase.auth.signOut();
          if (!error) {
            set({ user: null, session: null });
          }
          return { error };
        } catch (error) {
          console.error('Erreur lors de la déconnexion:', error);
          return { error: error as AuthError };
        } finally {
          set({ loading: false });
        }
      },

      // Réinitialisation du mot de passe
      resetPassword: async (email: string) => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email);
          return { error };
        } catch (error) {
          console.error('Erreur lors de la réinitialisation du mot de passe:', error);
          return { error: error as AuthError };
        }
      },

      // Initialisation du store
      initialize: async () => {
        try {
          set({ loading: true });
          
          // Récupérer la session initiale
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Erreur lors de la récupération de la session:', error);
          } else {
            set({ 
              session, 
              user: session?.user ?? null 
            });
          }

          // Écouter les changements d'authentification
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event: string, session: Session | null) => {
              console.log('Changement d\'état d\'authentification:', event);
              set({ 
                session, 
                user: session?.user ?? null,
                loading: false 
              });
            }
          );

          // Stocker la subscription pour pouvoir la nettoyer
          (get() as any)._subscription = subscription;
          
          set({ initialized: true });
        } catch (error) {
          console.error('Erreur lors de l\'initialisation:', error);
        } finally {
          set({ loading: false });
        }
      },

      // Nettoyage
      cleanup: () => {
        const subscription = (get() as any)._subscription;
        if (subscription) {
          subscription.unsubscribe();
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Ne persister que les données essentielles
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        initialized: state.initialized,
      }),
    }
  )
);

// Hooks utilitaires
export const useAuth = () => {
  const store = useAuthStore();
  return {
    user: store.user,
    session: store.session,
    loading: store.loading,
    initialized: store.initialized,
    signUp: store.signUp,
    signIn: store.signIn,
    signOut: store.signOut,
    resetPassword: store.resetPassword,
    initialize: store.initialize,
    cleanup: store.cleanup,
  };
};

export const useIsAuthenticated = () => {
  const user = useAuthStore((state) => state.user);
  return !!user;
};

export const useAuthUser = () => {
  return useAuthStore((state) => state.user);
};

export const useAuthSession = () => {
  return useAuthStore((state) => state.session);
};

export const useAuthLoading = () => {
  return useAuthStore((state) => state.loading);
}; 