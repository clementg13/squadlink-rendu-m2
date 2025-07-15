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
    // Initialiser le store d'authentification
    initialize();

    // Nettoyer lors du démontage
    return () => {
      cleanup();
    };
  }, [initialize, cleanup]);

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