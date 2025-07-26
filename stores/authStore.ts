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
  isOnboarding: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  setIsOnboarding: (isOnboarding: boolean) => void;
  
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
      isOnboarding: false,

      // Actions de base
      setUser: (user) => {
        console.log('👤 Store: Mise à jour utilisateur:', user ? 'Connecté' : 'Déconnecté');
        set({ user });
        
        // Supprimer le callback automatique qui cause la boucle
        // La navigation sera gérée par _layout.tsx
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
      setIsOnboarding: (isOnboarding) => {
        console.log('📋 Store: Mise à jour onboarding:', isOnboarding);
        set({ isOnboarding });
      },

      // Callback de redirection
      setOnAuthChange: (callback) => {
        console.log('📞 Store: Définition du callback de redirection');
        set({ onAuthChange: callback });
      },

      // Inscription
      signUp: async (email: string, password: string) => {
        try {
          console.log('📝 AuthStore: Tentative d\'inscription pour:', email);
          set({ loading: true });

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });

          if (error) {
            console.error('❌ AuthStore: Erreur d\'inscription:', error);
            set({ loading: false });
            return { error };
          }

          console.log('✅ AuthStore: Inscription réussie, utilisateur créé:', data.user?.id);
          
          // Attendre que la session soit bien établie
          if (data.user && data.session) {
            // Attendre un peu pour que Supabase établisse bien la session
            await new Promise(resolve => setTimeout(resolve, 500));
            
            set({ 
              user: data.user, 
              session: data.session,
              loading: false
            });
            
            console.log('✅ AuthStore: Session établie pour l\'onboarding');
          } else {
            set({ loading: false });
          }
          
          return { data, error: null };
        } catch (error) {
          console.error('❌ AuthStore: Exception lors de l\'inscription:', error);
          set({ loading: false });
          return { error: error as AuthError };
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
          console.log('🚪 AuthStore: Signing out user');
          
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.error('❌ AuthStore: Sign out error:', error);
            set({ loading: false });
            return { error };
          }

          // Clear store state
          set({ 
            user: null, 
            session: null, 
            loading: false,
            isOnboarding: false 
          });

          console.log('✅ AuthStore: User signed out successfully');
          
          return { error: null };
        } catch (error) {
          console.error('❌ AuthStore: Sign out failed:', error);
          set({ loading: false });
          return { error: error as AuthError };
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
              user: session?.user ?? null,
              loading: false,
              initialized: true,
              // Si un utilisateur est déjà connecté, désactiver le mode onboarding
              isOnboarding: session?.user ? false : false
            });
          }

          // Écouter les changements d'authentification
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event: string, session: Session | null) => {
              console.log('🔄 Store: Changement d\'état d\'authentification:', event);
              
              // Mise à jour simple sans callback
              set({
                session,
                user: session?.user ?? null,
                loading: false
              });
            }
          );

          // Stocker la subscription pour pouvoir la nettoyer
          (get() as AuthState & { _subscription?: unknown })._subscription = subscription;
          
          console.log('✅ Store: Initialisation terminée');
        } catch (error) {
          console.error('❌ Store: Erreur lors de l\'initialisation:', error);
          set({ loading: false, initialized: true });
        }
      },

      // Nettoyage
      cleanup: () => {
        console.log('🧹 Store: Nettoyage des subscriptions');
        const subscription = (get() as AuthState & { _subscription?: { unsubscribe: () => void } })._subscription;
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
        // Ne pas persister isOnboarding et onAuthChange
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
    isOnboarding: store.isOnboarding,
    signUp: store.signUp,
    signIn: store.signIn,
    signOut: store.signOut,
    resetPassword: store.resetPassword,
    initialize: store.initialize,
    cleanup: store.cleanup,
    setIsOnboarding: store.setIsOnboarding,
    setOnAuthChange: store.setOnAuthChange,
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