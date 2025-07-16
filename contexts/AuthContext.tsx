import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/stores/authStore';

// Contexte simplifié pour l'initialisation
interface AuthContextType {
  initialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props pour le provider
interface AuthProviderProps {
  children: ReactNode;
}

// Provider d'authentification simplifié
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const initialize = useAuthStore((state) => state.initialize);
  const cleanup = useAuthStore((state) => state.cleanup);
  const initialized = useAuthStore((state) => state.initialized);

  useEffect(() => {
    console.log('🚀 AuthProvider: Initialisation du store d\'authentification');
    
    // Initialiser le store d'authentification
    initialize();

    // Nettoyer lors du démontage
    return () => {
      console.log('🧹 AuthProvider: Nettoyage du store d\'authentification');
      cleanup();
    };
  }, [initialize, cleanup]);

  useEffect(() => {
    console.log('📊 AuthProvider: État d\'initialisation changé:', initialized);
  }, [initialized]);

  const value: AuthContextType = {
    initialized,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook pour utiliser le contexte d'initialisation
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext doit être utilisé dans un AuthProvider');
  }
  return context;
};

// Re-export des hooks du store pour la compatibilité
export { useAuth, useIsAuthenticated, useAuthUser, useAuthSession, useAuthLoading } from '@/stores/authStore'; 