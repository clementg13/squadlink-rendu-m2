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
  
  // Callback de redirection
  onAuthChange?: (user: User | null) => void;
  setOnAuthChange: (callback: (user: User | null) => void) => void;
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
      setUser: (user) => {
        console.log('👤 Store: Mise à jour utilisateur:', user ? 'Connecté' : 'Déconnecté');
        set({ user });
        
        // Appeler le callback de redirection si défini
        const { onAuthChange } = get();
        if (onAuthChange) {
          console.log('🔄 Store: Appel du callback de redirection');
          onAuthChange(user);
        }
      },
      setSession: (session) => {
        console.log('🔐 Store: Mise à jour session:', session ? 'Active' : 'Inactive');
        set({ session });
      },
      setLoading: (loading) => {
        console.log('⏳ Store: Mise à jour loading:', loading);
        set({ loading });
      },
      setInitialized: (initialized) => {
        console.log('🚀 Store: Mise à jour initialized:', initialized);
        set({ initialized });
      },

      // Callback de redirection
      setOnAuthChange: (callback) => {
        console.log('📞 Store: Définition du callback de redirection');
        set({ onAuthChange: callback });
      },

      // Inscription
      signUp: async (email: string, password: string) => {
        try {
          console.log('📝 Store: Tentative d\'inscription pour:', email);
          set({ loading: true });
          const { error } = await supabase.auth.signUp({
            email,
            password,
          });
          console.log('📝 Store: Résultat inscription:', error ? 'Erreur' : 'Succès');
          return { error };
        } catch (error) {
          console.error('❌ Store: Erreur lors de l\'inscription:', error);
          return { error: error as AuthError };
        } finally {
          set({ loading: false });
        }
      },

      // Connexion
      signIn: async (email: string, password: string) => {
        try {
          console.log('🔑 Store: Tentative de connexion pour:', email);
          set({ loading: true });
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          console.log('🔑 Store: Résultat connexion:', error ? 'Erreur' : 'Succès');
          return { error };
        } catch (error) {
          console.error('❌ Store: Erreur lors de la connexion:', error);
          return { error: error as AuthError };
        } finally {
          set({ loading: false });
        }
      },

      // Déconnexion
      signOut: async () => {
        try {
          console.log('🚪 Store: Tentative de déconnexion');
          set({ loading: true });
          const { error } = await supabase.auth.signOut();
          if (!error) {
            console.log('🚪 Store: Déconnexion réussie, nettoyage de l\'état');
            set({ user: null, session: null });
          }
          return { error };
        } catch (error) {
          console.error('❌ Store: Erreur lors de la déconnexion:', error);
          return { error: error as AuthError };
        } finally {
          set({ loading: false });
        }
      },

      // Réinitialisation du mot de passe
      resetPassword: async (email: string) => {
        try {
          console.log('🔄 Store: Réinitialisation mot de passe pour:', email);
          const { error } = await supabase.auth.resetPasswordForEmail(email);
          console.log('🔄 Store: Résultat réinitialisation:', error ? 'Erreur' : 'Succès');
          return { error };
        } catch (error) {
          console.error('❌ Store: Erreur lors de la réinitialisation du mot de passe:', error);
          return { error: error as AuthError };
        }
      },

      // Initialisation du store
      initialize: async () => {
        try {
          console.log('🚀 Store: Début de l\'initialisation');
          set({ loading: true });
          
          // Récupérer la session initiale
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('❌ Store: Erreur lors de la récupération de la session:', error);
          } else {
            console.log('📋 Store: Session récupérée:', session ? 'Trouvée' : 'Aucune');
            set({ 
              session, 
              user: session?.user ?? null 
            });
          }

          // Écouter les changements d'authentification
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event: string, session: Session | null) => {
              console.log('🔄 Store: Changement d\'état d\'authentification:', event, session ? 'Session active' : 'Pas de session');
              
              // Utiliser setUser et setSession pour déclencher les callbacks
              const { setUser, setSession, setLoading } = get();
              setSession(session);
              setUser(session?.user ?? null);
              setLoading(false);
            }
          );

          // Stocker la subscription pour pouvoir la nettoyer
          (get() as any)._subscription = subscription;
          
          console.log('✅ Store: Initialisation terminée');
          set({ initialized: true });
        } catch (error) {
          console.error('❌ Store: Erreur lors de l\'initialisation:', error);
        } finally {
          set({ loading: false });
        }
      },

      // Nettoyage
      cleanup: () => {
        console.log('🧹 Store: Nettoyage des subscriptions');
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